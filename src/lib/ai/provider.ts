import type { AIAnalysisResponse, TokenUsage } from '@/types/analysis'

export interface AnalysisInput {
  sketchImageBase64: string
  sketchMimeType: string
  sitePhotoBase64?: string[]
  spaceType: string
  roughAreaM2?: number | null
  textNotes?: string | null
}

export interface AnalysisOutput {
  result: AIAnalysisResponse
  tokenUsage: TokenUsage
  rawResponse: unknown
}

export type AIStreamEvent =
  | { type: 'ai_start' }
  | { type: 'ai_progress'; outputTokens: number }
  | { type: 'ai_done'; outputTokens: number; inputTokens: number }

export interface AIProvider {
  name: string
  model: string
  analyze(input: AnalysisInput): Promise<AnalysisOutput>
  analyzeStream?(input: AnalysisInput, onEvent: (e: AIStreamEvent) => void): Promise<AnalysisOutput>
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'claude'
  if (provider === 'claude') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ClaudeProvider } = require('./claude')
    return new ClaudeProvider()
  }
  if (provider === 'gemini') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GeminiProvider } = require('./gemini')
    return new GeminiProvider()
  }
  throw new Error(`지원하지 않는 AI 프로바이더: ${provider}`)
}
