'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 분석 중 상태에서 주기적으로 페이지를 갱신합니다.
 * 프로젝트 상태가 'analyzing'인 경우에만 마운트되어야 합니다.
 */
export function AnalysisPoller({ projectId }: { projectId: string }) {
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 40 // 최대 2분 (3초 × 40회)

    const poll = async () => {
      attempts++
      if (attempts > MAX_ATTEMPTS) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        return
      }
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (!res.ok) return
        const { project } = await res.json()
        if (project?.status !== 'analyzing') {
          router.refresh()
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch {
        // 네트워크 오류 무시 — 다음 폴링 때 재시도
      }
    }

    intervalRef.current = setInterval(poll, 3000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [projectId, router])

  return null
}
