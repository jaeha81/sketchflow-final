import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File, userId: string, projectId: string, type: 'sketch' | 'photo') {
  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = `${userId}/${projectId}/${type}/${filename}`

  const { error } = await supabase.storage.from('project-files').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw new Error(`업로드 실패: ${error.message}`)
  return { path }
}
