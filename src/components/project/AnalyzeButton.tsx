'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

const PHASE_LABEL: Record<string, string> = {
  download: '이미지 다운로드 중',
  compress: '이미지 최적화 중',
  ai_start: 'AI 분석 시작',
  ai_progress: 'AI 분석 중',
  persist: '결과 저장 중',
}

type Progress = { phase: string; outputTokens?: number }

export function AnalyzeButton({ projectId, label = '분석 시작' }: { projectId: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setProgress({ phase: 'download' })

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze/stream`, { method: 'POST' })
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({ error: '분석 실패' }))
        throw new Error(d.error || '분석 실패')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let completed = false
      let streamError: string | null = null

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const frames = buf.split('\n\n')
        buf = frames.pop() ?? ''
        for (const frame of frames) {
          const line = frame.split('\n').find((l) => l.startsWith('data: '))
          if (!line) continue
          try {
            const evt = JSON.parse(line.slice(6))
            if (evt.type === 'phase') setProgress({ phase: evt.phase })
            else if (evt.type === 'ai_start') setProgress({ phase: 'ai_start' })
            else if (evt.type === 'ai_progress') setProgress({ phase: 'ai_progress', outputTokens: evt.outputTokens })
            else if (evt.type === 'ai_done') setProgress({ phase: 'persist' })
            else if (evt.type === 'complete') completed = true
            else if (evt.type === 'error') streamError = evt.message
          } catch {
            /* ignore parse errors */
          }
        }
      }

      if (streamError) throw new Error(streamError)
      if (!completed) throw new Error('분석이 완료되지 않았습니다')

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생')
      setLoading(false)
      setProgress(null)
    }
  }

  const status = progress
    ? progress.phase === 'ai_progress' && progress.outputTokens
      ? `${PHASE_LABEL.ai_progress} (${progress.outputTokens} tokens)`
      : PHASE_LABEL[progress.phase] ?? '분석 중'
    : '분석 중...'

  return (
    <div className="inline-block">
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {status}
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {label}
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
