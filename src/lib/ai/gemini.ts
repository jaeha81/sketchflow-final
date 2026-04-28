import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다')

    const prompt = buildAnalysisPrompt(input)
    const parts: Array<Record<string, unknown>> = []

    parts.push({
      inline_data: { mime_type: input.sketchMimeType, data: input.sketchImageBase64 },
    })

    if (input.sitePhotoBase64?.length) {
      for (const photo of input.sitePhotoBase64) {
        parts.push({ inline_data: { mime_type: 'image/jpeg', data: photo } })
      }
    }

    parts.push({ text: prompt })

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Gemini API 오류 (${response.status}): ${body}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.find(
      (p: Record<string, unknown>) => typeof p.text === 'string'
    )?.text as string | undefined
    if (!text) throw new Error('Gemini 응답에 텍스트가 없습니다')

    const result = parseAndValidateResponse(text)
    const inTok = data.usageMetadata?.promptTokenCount || 0
    const outTok = data.usageMetadata?.candidatesTokenCount || 0

    return {
      result,
      tokenUsage: { input_tokens: inTok, output_tokens: outTok, total_cost_usd: 0 },
      rawResponse: data,
    }
  }
}
