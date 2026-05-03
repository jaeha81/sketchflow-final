import type { SupabaseClient } from '@supabase/supabase-js'
import { compressForVision } from './image'
import { getAIProvider } from './provider'
import type { AIStreamEvent, AnalysisOutput } from './provider'

const STORAGE_BUCKET = 'project-files'
const MAX_PHOTOS = 3

export type PipelineEvent =
  | { type: 'phase'; phase: 'download' | 'compress' | 'persist' }
  | { type: 'sources'; sketchBytes: number; photoCount: number; totalPhotoBytes: number }
  | AIStreamEvent
  | { type: 'complete'; analysisId: string; version: number; processingTimeMs: number }
  | { type: 'error'; message: string }

type Project = {
  id: string
  space_type: string
  rough_area_m2: number | null
  text_notes: string | null
  sketch_url: string
}

async function downloadAndCompress(supabase: SupabaseClient, path: string) {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(path)
  if (error || !data) throw new Error(`다운로드 실패: ${path}`)
  const buf = Buffer.from(await data.arrayBuffer())
  return compressForVision(buf)
}

export async function runAnalysisPipeline(
  supabase: SupabaseClient,
  project: Project,
  onEvent: (e: PipelineEvent) => void,
): Promise<{ analysisId: string; version: number; output: AnalysisOutput; processingTimeMs: number }> {
  const startTime = Date.now()

  await supabase.from('projects').update({ status: 'analyzing', error_message: null }).eq('id', project.id)

  onEvent({ type: 'phase', phase: 'download' })

  const { data: photoRows } = await supabase
    .from('project_photos')
    .select('photo_url')
    .eq('project_id', project.id)
    .order('sort_order')
    .limit(MAX_PHOTOS)

  const photoPaths = (photoRows ?? []).map((p) => p.photo_url as string)

  const [sketch, ...photos] = await Promise.all([
    downloadAndCompress(supabase, project.sketch_url),
    ...photoPaths.map((p) =>
      downloadAndCompress(supabase, p).catch(() => null),
    ),
  ])

  const validPhotos = photos.filter((p): p is NonNullable<typeof p> => p !== null)

  onEvent({ type: 'phase', phase: 'compress' })
  onEvent({
    type: 'sources',
    sketchBytes: sketch.bytes,
    photoCount: validPhotos.length,
    totalPhotoBytes: validPhotos.reduce((s, p) => s + p.bytes, 0),
  })

  const provider = getAIProvider()
  const analysisInput = {
    sketchImageBase64: sketch.base64,
    sketchMimeType: sketch.mimeType,
    sitePhotoBase64: validPhotos.length ? validPhotos.map((p) => p.base64) : undefined,
    spaceType: project.space_type,
    roughAreaM2: project.rough_area_m2,
    textNotes: project.text_notes,
  }

  const output = provider.analyzeStream
    ? await provider.analyzeStream(analysisInput, (e) => onEvent(e))
    : await (async () => {
        onEvent({ type: 'ai_start' })
        const result = await provider.analyze(analysisInput)
        onEvent({
          type: 'ai_done',
          outputTokens: result.tokenUsage.output_tokens,
          inputTokens: result.tokenUsage.input_tokens,
        })
        return result
      })()

  onEvent({ type: 'phase', phase: 'persist' })

  const processingTimeMs = Date.now() - startTime
  const { count } = await supabase
    .from('analysis_results')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', project.id)

  const { data: analysis, error: insertErr } = await supabase
    .from('analysis_results')
    .insert({
      project_id: project.id,
      version: (count ?? 0) + 1,
      ai_provider: provider.name,
      ai_model: provider.model,
      raw_ai_response: output.rawResponse,
      spatial_summary: output.result.spatial_summary,
      missing_info: output.result.missing_info,
      construction_categories: output.result.construction_categories,
      estimate_items: output.result.estimate_items,
      client_summary: output.result.client_summary,
      design_analysis: output.result.design_analysis ?? {},
      is_current: true,
      processing_time_ms: processingTimeMs,
      token_usage: output.tokenUsage,
    })
    .select('id, version')
    .single()

  if (insertErr || !analysis) throw new Error('분석 결과 저장 실패')

  await supabase.from('projects').update({ status: 'completed' }).eq('id', project.id)

  onEvent({
    type: 'complete',
    analysisId: analysis.id,
    version: analysis.version,
    processingTimeMs,
  })

  return { analysisId: analysis.id, version: analysis.version, output, processingTimeMs }
}
