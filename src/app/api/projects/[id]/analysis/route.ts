import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })
  const { data, error } = await supabase.from('analysis_results').select('*').eq('project_id', id).eq('is_current', true).single()
  if (error || !data) return NextResponse.json({ error: '분석 결과 없음' }, { status: 404 })
  return NextResponse.json({ analysis: data })
}
