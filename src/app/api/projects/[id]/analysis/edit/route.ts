import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 중첩 경로 파싱: "zones[0].name_ko" → ["zones", "0", "name_ko"]
function parsePath(path: string): string[] {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
}

// 중첩 경로에 값을 설정한 새 객체 반환
function setNestedValue(obj: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value
  const [head, ...rest] = path
  const idx = parseInt(head)
  if (!isNaN(idx) && Array.isArray(obj)) {
    const arr = [...obj]
    arr[idx] = setNestedValue(arr[idx], rest, value)
    return arr
  }
  if (typeof obj === 'object' && obj !== null) {
    const record = obj as Record<string, unknown>
    return { ...record, [head]: setNestedValue(record[head], rest, value) }
  }
  return value
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 })

  const { field_path, new_value } = await request.json()
  if (!field_path || new_value === undefined) return NextResponse.json({ error: 'field_path와 new_value 필요' }, { status: 400 })

  const { data: analysis } = await supabase.from('analysis_results').select('*').eq('project_id', id).eq('is_current', true).single()
  if (!analysis) return NextResponse.json({ error: '분석 결과 없음' }, { status: 404 })

  const validTopFields = ['spatial_summary', 'missing_info', 'construction_categories', 'estimate_items', 'client_summary']
  const parts = parsePath(field_path)
  const topField = parts[0]

  if (!topField || !validTopFields.includes(topField)) {
    return NextResponse.json({ error: `수정 불가 필드: ${topField}` }, { status: 400 })
  }

  const originalValue = analysis[topField]

  // 중첩 경로 업데이트: top-level 객체를 수정하여 저장
  const nestedPath = parts.slice(1)
  const updatedValue = nestedPath.length > 0
    ? setNestedValue(originalValue, nestedPath, new_value)
    : new_value

  const { error } = await supabase.from('analysis_results').update({ [topField]: updatedValue }).eq('id', analysis.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 편집 이력 저장 (실패해도 메인 응답에 영향 없음)
  try {
    await supabase.from('user_edits').insert({
      analysis_id: analysis.id,
      field_path,
      original_value: originalValue,
      new_value: updatedValue,
      edited_by: user.id,
    })
  } catch { /* 이력 저장 실패는 무시 */ }

  return NextResponse.json({ success: true, field_path })
}
