import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: '파일 필요' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: '10MB 초과' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${id}/sketch/sketch_${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage.from('project-files').upload(path, file, { cacheControl: '3600', upsert: true })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { error: dbErr } = await supabase.from('projects').update({ sketch_url: path }).eq('id', id)
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })

  return NextResponse.json({ sketch_url: path })
}
