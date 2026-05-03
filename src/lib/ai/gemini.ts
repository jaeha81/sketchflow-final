import { GoogleGenerativeAI, type Content } from '@google/generative-ai'
import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

const SYSTEM_PROMPT = `당신은 인테리어 시공 전문가이자 공간 디자인 코드 변환 전문가입니다.
스케치 이미지를 분석하여 시공 워크플로우 데이터와 디자인 코드를 JSON으로 반환합니다.
응답은 반드시 순수 JSON만 포함해야 하며, 마크다운 코드블록이나 추가 텍스트를 포함하지 마세요.`

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다')

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({
      model: this.model,
      systemInstruction: SYSTEM_PROMPT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 32768,
        thinkingConfig: { thinkingBudget: 0 },
      } as any,
    })

    const prompt = buildAnalysisPrompt(input)
    const parts: Content['parts'] = [
      {
        inlineData: {
          mimeType: input.sketchMimeType,
          data: input.sketchImageBase64,
        },
      },
    ]

    if (input.sitePhotoBase64?.length) {
      for (const photo of input.sitePhotoBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: photo } })
      }
    }

    parts.push({ text: prompt })

    const response = await model.generateContent({
      contents: [{ role: 'user', parts }],
    })

    const text = response.response.text()
    if (!text) throw new Error('Gemini 응답에 텍스트가 없습니다')

    const result = parseAndValidateResponse(text)
    const usage = response.response.usageMetadata
    const inTok = usage?.promptTokenCount ?? 0
    const outTok = usage?.candidatesTokenCount ?? 0
    // Gemini 2.5 Flash 가격: $0.30/M input, $2.50/M output (무료 티어 한도 내 무료)
    const cost = (inTok * 0.3 + outTok * 2.5) / 1_000_000

    return {
      result,
      tokenUsage: {
        input_tokens: inTok,
        output_tokens: outTok,
        total_cost_usd: Math.round(cost * 10000) / 10000,
      },
      rawResponse: response.response,
    }
  }
}
