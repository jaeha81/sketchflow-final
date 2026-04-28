import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

export class GroqProvider implements AIProvider {
  name = 'groq'
  model = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY가 설정되지 않았습니다')

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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.2,
        max_tokens: 8000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Groq API 오류 (${response.status}): ${body}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content as string | undefined
    if (!text) throw new Error('Groq 응답에 텍스트가 없습니다')

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
