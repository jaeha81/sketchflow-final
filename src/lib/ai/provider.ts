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

export interface AIProvider {
  name: string
  model: string
  analyze(input: AnalysisInput): Promise<AnalysisOutput>
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'claude'
  if (provider === 'claude') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ClaudeProvider } = require('./claude')
    return new ClaudeProvider()
  }
  throw new Error(`지원하지 않는 AI 프로바이더: ${provider}`)
}
