import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAnalysisPipeline } from '@/lib/ai/pipeline'

// Vercel: 최대 60초 허용 (Pro 플랜 기준, Hobby는 10초)
export const maxDuration = 60

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  try {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!project) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })
    if (!project.sketch_url) return NextResponse.json({ error: '스케치 없음' }, { status: 400 })

    const { analysisId, version, output, processingTimeMs } = await runAnalysisPipeline(
      supabase,
      project,
      () => {},
    )

    return NextResponse.json({
      analysis_id: analysisId,
      version,
      processing_time_ms: processingTimeMs,
      token_usage: output.tokenUsage,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류'
    await supabase.from('projects').update({ status: 'error', error_message: msg }).eq('id', id)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
