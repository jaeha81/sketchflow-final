import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  model = 'claude-sonnet-4-6'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')

    const prompt = buildAnalysisPrompt(input)
    const userContent: Array<Record<string, unknown>> = []

    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: input.sketchMimeType, data: input.sketchImageBase64 },
    })

    if (input.sitePhotoBase64?.length) {
      for (const photo of input.sitePhotoBase64) {
        userContent.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: photo },
        })
      }
    }

    userContent.push({ type: 'text', text: prompt })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8000,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Claude API 오류 (${response.status}): ${body}`)
    }

    const data = await response.json()
    const textBlock = data.content?.find((b: Record<string, unknown>) => b.type === 'text')
    if (!textBlock?.text) throw new Error('Claude 응답에 텍스트가 없습니다')

    const result = parseAndValidateResponse(textBlock.text as string)
    const inTok = data.usage?.input_tokens || 0
    const outTok = data.usage?.output_tokens || 0
    const cost = (inTok * 3 + outTok * 15) / 1_000_000

    return {
      result,
      tokenUsage: { input_tokens: inTok, output_tokens: outTok, total_cost_usd: Math.round(cost * 10000) / 10000 },
      rawResponse: data,
    }
  }
}
