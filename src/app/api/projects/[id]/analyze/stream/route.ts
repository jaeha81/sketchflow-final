import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAnalysisPipeline, type PipelineEvent } from '@/lib/ai/pipeline'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function sseFrame(event: PipelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: '인증 필요' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) {
    return new Response(JSON.stringify({ error: '프로젝트 없음' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }
  if (!project.sketch_url) {
    return new Response(JSON.stringify({ error: '스케치 없음' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: PipelineEvent) => {
        controller.enqueue(encoder.encode(sseFrame(event)))
      }

      try {
        await runAnalysisPipeline(supabase, project, send)
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류'
        await supabase.from('projects').update({ status: 'error', error_message: msg }).eq('id', id)
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no',
      connection: 'keep-alive',
    },
  })
}
