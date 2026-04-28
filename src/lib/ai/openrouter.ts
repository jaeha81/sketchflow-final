import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

export class OpenRouterProvider implements AIProvider {
  name = 'openrouter'
  model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다')

    const prompt = buildAnalysisPrompt(input)
    const userContent: Array<Record<string, unknown>> = []

    userContent.push({
      type: 'image_url',
      image_url: { url: `data:${input.sketchMimeType};base64,${input.sketchImageBase64}` },
    })

    if (input.sitePhotoBase64?.length) {
      for (const photo of input.sitePhotoBase64) {
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${photo}` },
        })
      }
    }

    userContent.push({ type: 'text', text: prompt })

    const referer = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'SketchFlow'

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': appName,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.2,
        max_tokens: 8000,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`OpenRouter API 오류 (${response.status}): ${body}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content as string | undefined
    if (!text) throw new Error('OpenRouter 응답에 텍스트가 없습니다')

    const result = parseAndValidateResponse(text)
    const inTok = data.usage?.prompt_tokens || 0
    const outTok = data.usage?.completion_tokens || 0

    return {
      result,
      tokenUsage: { input_tokens: inTok, output_tokens: outTok, total_cost_usd: 0 },
      rawResponse: data,
    }
  }
}
