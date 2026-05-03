import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt } from './prompt'
import { parseAndValidateResponse } from './parser'

const SYSTEM_PROMPT = `당신은 인테리어 시공 전문가이자 공간 디자인 코드 변환 전문가입니다.
스케치 이미지를 분석하여 시공 워크플로우 데이터와 디자인 코드를 JSON으로 반환합니다.
응답은 반드시 순수 JSON만 포함해야 하며, 마크다운 코드블록이나 추가 텍스트를 포함하지 마세요.`

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
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 10000,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
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
    const cacheRead = data.usage?.cache_read_input_tokens || 0
    const cacheCreate = data.usage?.cache_creation_input_tokens || 0
    // 캐시 히트 시 input 비용 90% 절감 (read: $0.30/M, create: $3.75/M, output: $15/M)
    const cost = (inTok * 3 + cacheCreate * 3.75 + cacheRead * 0.3 + outTok * 15) / 1_000_000

    return {
      result,
      tokenUsage: {
        input_tokens: inTok,
        output_tokens: outTok,
        total_cost_usd: Math.round(cost * 10000) / 10000,
      },
      rawResponse: data,
    }
  }
}
