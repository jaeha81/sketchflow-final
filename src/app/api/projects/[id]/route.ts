import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectSchema } from '@/lib/utils/validation'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { data: project, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error || !project) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })

  const { data: photos } = await supabase.from('project_photos').select('*').eq('project_id', id).order('sort_order')
  const { data: analysis } = await supabase.from('analysis_results').select('*').eq('project_id', id).eq('is_current', true).single()
  const { count } = await supabase.from('analysis_results').select('id', { count: 'exact', head: true }).eq('project_id', id)

  return NextResponse.json({ project: { ...project, photos: photos || [], current_analysis: analysis || null, analysis_count: count || 0 } })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const body = await request.json()
  const parsed = updateProjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '입력 오류' }, { status: 400 })
  const { data, error } = await supabase.from('projects').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project: data })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
