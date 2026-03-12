import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema } from '@/lib/utils/validation'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const { data, error } = await supabase.from('projects').select('id, name, space_type, status, sketch_url, created_at, updated_at').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ projects: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const body = await request.json()
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: '입력 데이터 오류', details: parsed.error.flatten() }, { status: 400 })
  const { data, error } = await supabase.from('projects').insert({ user_id: user.id, ...parsed.data, status: 'draft' }).select('id, name, status').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project: data }, { status: 201 })
}
