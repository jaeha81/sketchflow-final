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

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} 타임아웃 (${ms}ms 초과)`)), ms)
    promise.then(
      (v) => { clearTimeout(t); resolve(v) },
      (e) => { clearTimeout(t); reject(e) },
    )
  })
}

function instantiateProvider(name: string): AIProvider {
  switch (name) {
    case 'claude': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ClaudeProvider } = require('./claude')
      return new ClaudeProvider()
    }
    case 'gemini': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GeminiProvider } = require('./gemini')
      return new GeminiProvider()
    }
    case 'openrouter': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OpenRouterProvider } = require('./openrouter')
      return new OpenRouterProvider()
    }
    case 'groq': {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GroqProvider } = require('./groq')
      return new GroqProvider()
    }
    default:
      throw new Error(`지원하지 않는 AI 프로바이더: ${name}`)
  }
}

export class CascadeProvider implements AIProvider {
  name = 'cascade'
  model = ''
  private chain: string[]
  private timeoutMs: number

  constructor(chain: string[], timeoutMs: number) {
    if (chain.length === 0) throw new Error('AI_PROVIDER_CHAIN이 비어 있습니다')
    this.chain = chain
    this.timeoutMs = timeoutMs
  }

  async analyze(input: AnalysisInput): Promise<AnalysisOutput> {
    const errors: string[] = []
    for (const providerName of this.chain) {
      try {
        const provider = instantiateProvider(providerName)
        const output = await withTimeout(
          provider.analyze(input),
          this.timeoutMs,
          `${providerName} 분석`,
        )
        this.name = provider.name
        this.model = provider.model
        return output
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        errors.push(`[${providerName}] ${msg}`)
      }
    }
    throw new Error(`모든 프로바이더 실패:\n${errors.join('\n')}`)
  }
}

export function getAIProvider(): AIProvider {
  const timeoutMs = Number(process.env.AI_PROVIDER_TIMEOUT_MS || '20000')
  const chainEnv = process.env.AI_PROVIDER_CHAIN

  if (chainEnv && chainEnv.trim()) {
    const chain = chainEnv.split(',').map((s) => s.trim()).filter(Boolean)
    return new CascadeProvider(chain, timeoutMs)
  }

  const single = process.env.AI_PROVIDER
  if (single && single.trim()) {
    return instantiateProvider(single.trim())
  }

  return new CascadeProvider(['gemini', 'openrouter', 'groq'], timeoutMs)
}
