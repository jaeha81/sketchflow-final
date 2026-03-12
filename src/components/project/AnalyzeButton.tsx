'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

export function AnalyzeButton({ projectId, label = '분석 시작' }: { projectId: string; label?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleAnalyze = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, { method: 'POST' })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '분석 실패') }
      router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : '오류 발생'); setLoading(false) }
  }

  return (
    <div className="inline-block">
      <button onClick={handleAnalyze} disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
        {loading ? <><Loader2 size={16} className="animate-spin" />분석 중...</> : <><Sparkles size={16} />{label}</>}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
