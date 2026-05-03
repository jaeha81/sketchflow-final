import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AnalysisInput, AnalysisOutput } from './provider'
import { buildAnalysisPrompt, STATIC_PROMPT_PREAMBLE } from './prompt'
import { parseAndValidateResponse } from './parser'
import { ANALYSIS_TOOL_SCHEMA } from './tool-schema'

const SYSTEM_PROMPT = `당신은 인테리어 시공 전문가이자 공간 디자인 코드 변환 전문가입니다.
스케치 이미지를 분석하여 시공 워크플로우 데이터와 디자인 코드를 submit_analysis 도구로 반환합니다.
도구의 input_schema를 엄격히 따르세요.`

const TOOL_NAME = 'submit_analysis'

export type StreamEvent =
  | { type: 'ai_start' }
  | { type: 'ai_progress'; outputTokens: number }
  | { type: 'ai_done'; outputTokens: number; inputTokens: number }

function buildMessageRequest(input: AnalysisInput) {
  const userContent: Anthropic.ContentBlockParam[] = []

  userContent.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: input.sketchMimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
      data: input.sketchImageBase64,
    },
  })

  if (input.sitePhotoBase64?.length) {
    for (const photo of input.sitePhotoBase64) {
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: photo },
      })
    }
  }

  userContent.push({
    type: 'text',
    text: STATIC_PROMPT_PREAMBLE,
    cache_control: { type: 'ephemeral' },
  })
  userContent.push({ type: 'text', text: buildAnalysisPrompt(input) })

  return {
    model: 'claude-sonnet-4-6',
    max_tokens: 10000,
    system: [
      {
        type: 'text' as const,
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    tools: [
      {
        name: TOOL_NAME,
        description: '인테리어 스케치 분석 결과를 구조화된 JSON으로 제출합니다.',
        input_schema: ANALYSIS_TOOL_SCHEMA,
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    tool_choice: { type: 'tool' as const, name: TOOL_NAME },
    messages: [{ role: 'user' as const, content: userContent }],
  }
}

export class ClaudeProvider implements AIProvider {
  name = 'claude'
  model = 'claude-sonnet-4-6'

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create(buildMessageRequest(input))
    return this.toOutput(message)
  }

  async analyzeStream(
    input: AnalysisInput,
    onEvent: (e: StreamEvent) => void,
  ): Promise<AnalysisOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다')
    const client = new Anthropic({ apiKey })

    onEvent({ type: 'ai_start' })

    const stream = client.messages.stream(buildMessageRequest(input))

    let lastReported = 0
    stream.on('text', () => {
      // text deltas inside tool_use partial json — counted via usage updates below
    })
    stream.on('streamEvent', (event) => {
      if (event.type === 'message_delta' && event.usage?.output_tokens) {
        const t = event.usage.output_tokens
        if (t - lastReported >= 200) {
          lastReported = t
          onEvent({ type: 'ai_progress', outputTokens: t })
        }
      }
    })

    const message = await stream.finalMessage()
    onEvent({
      type: 'ai_done',
      outputTokens: message.usage.output_tokens,
      inputTokens: message.usage.input_tokens,
    })
    return this.toOutput(message)
  }

  private toOutput(message: Anthropic.Message): AnalysisOutput {
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === TOOL_NAME,
    )

    let result
    if (toolBlock) {
      result = parseAndValidateResponse(JSON.stringify(toolBlock.input))
    } else {
      const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
      if (!textBlock) throw new Error('Claude 응답에 tool_use 또는 text가 없습니다')
      result = parseAndValidateResponse(textBlock.text)
    }

    const { input_tokens: inTok, output_tokens: outTok } = message.usage
    const cacheRead = message.usage.cache_read_input_tokens ?? 0
    const cacheCreate = message.usage.cache_creation_input_tokens ?? 0
    // 캐시 히트 시 input 비용 90% 절감 (read: $0.30/M, create: $3.75/M, output: $15/M)
    const cost = (inTok * 3 + cacheCreate * 3.75 + cacheRead * 0.3 + outTok * 15) / 1_000_000

    return {
      result,
      tokenUsage: {
        input_tokens: inTok,
        output_tokens: outTok,
        total_cost_usd: Math.round(cost * 10000) / 10000,
      },
      rawResponse: message,
    }
  }
}
