import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai/provider'

// Vercel: 최대 60초 허용 (Pro 플랜 기준, Hobby는 10초)
export const maxDuration = 60

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const startTime = Date.now()
  try {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
    if (!project) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })
    if (!project.sketch_url) return NextResponse.json({ error: '스케치 없음' }, { status: 400 })

    await supabase.from('projects').update({ status: 'analyzing', error_message: null }).eq('id', id)

    const { data: sketchData, error: dlErr } = await supabase.storage.from('project-files').download(project.sketch_url)
    if (dlErr || !sketchData) throw new Error('스케치 다운로드 실패')

    const buf = await sketchData.arrayBuffer()
    const b64 = Buffer.from(buf).toString('base64')
    const ext = project.sketch_url.split('.').pop()?.toLowerCase()
    const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic' }

    // 현장 사진 (최대 3장)
    const { data: photos } = await supabase.from('project_photos').select('photo_url').eq('project_id', id).order('sort_order').limit(3)
    const photoB64: string[] = []
    if (photos) {
      for (const p of photos) {
        try { const { data: d } = await supabase.storage.from('project-files').download(p.photo_url); if (d) { const b = await d.arrayBuffer(); photoB64.push(Buffer.from(b).toString('base64')) } } catch { /* skip */ }
      }
    }

    const provider = getAIProvider()
    const output = await provider.analyze({
      sketchImageBase64: b64, sketchMimeType: mimeMap[ext || ''] || 'image/jpeg',
      sitePhotoBase64: photoB64.length ? photoB64 : undefined,
      spaceType: project.space_type, roughAreaM2: project.rough_area_m2, textNotes: project.text_notes,
    })

    const pt = Date.now() - startTime
    const { count } = await supabase.from('analysis_results').select('id', { count: 'exact', head: true }).eq('project_id', id)

    const { data: analysis } = await supabase.from('analysis_results').insert({
      project_id: id, version: (count || 0) + 1, ai_provider: provider.name, ai_model: provider.model,
      raw_ai_response: output.rawResponse, spatial_summary: output.result.spatial_summary,
      missing_info: output.result.missing_info, construction_categories: output.result.construction_categories,
      estimate_items: output.result.estimate_items, client_summary: output.result.client_summary,
      is_current: true, processing_time_ms: pt, token_usage: output.tokenUsage,
    }).select('id, version').single()

    await supabase.from('projects').update({ status: 'completed' }).eq('id', id)
    return NextResponse.json({ analysis_id: analysis?.id, version: analysis?.version, processing_time_ms: pt, token_usage: output.tokenUsage })
  } catch (err) {
    const msg = err instanceof Error ? err.message : '알 수 없는 오류'
    await supabase.from('projects').update({ status: 'error', error_message: msg }).eq('id', id)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
