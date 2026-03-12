import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { count } = await supabase.from('project_photos').select('id', { count: 'exact', head: true }).eq('project_id', id)
  if ((count || 0) >= 5) return NextResponse.json({ error: '최대 5장' }, { status: 400 })

  const fd = await request.formData()
  const file = fd.get('file') as File | null; const label = fd.get('label') as string | null
  if (!file) return NextResponse.json({ error: '파일 필요' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: '10MB 초과' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${user.id}/${id}/photos/photo_${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('project-files').upload(path, file, { cacheControl: '3600' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: photo, error: dbErr } = await supabase.from('project_photos').insert({ project_id: id, photo_url: path, label, sort_order: (count || 0) + 1 }).select().single()
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 })
  return NextResponse.json({ photo }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const photoId = request.nextUrl.searchParams.get('photoId')
  if (!photoId) return NextResponse.json({ error: 'photoId 필요' }, { status: 400 })

  const { data: photo } = await supabase.from('project_photos').select('photo_url').eq('id', photoId).single()
  if (photo?.photo_url) await supabase.storage.from('project-files').remove([photo.photo_url])
  const { error } = await supabase.from('project_photos').delete().eq('id', photoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
