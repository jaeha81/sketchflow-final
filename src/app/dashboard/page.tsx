import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { PROJECT_STATUS_LABELS, SPACE_TYPES } from '@/lib/utils/constants'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
  const { data: projects } = await supabase.from('projects').select('id, name, space_type, status, sketch_url, created_at, updated_at').order('updated_at', { ascending: false })
  const spaceLabel = (v: string) => SPACE_TYPES.find(t => t.value === v)?.label || v

  return (
    <div className="min-h-screen bg-gray-50">
      <Header displayName={profile?.display_name || user.email || ''} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-xl font-bold text-gray-900">프로젝트</h2><p className="text-sm text-gray-500 mt-1">{projects?.length || 0}개의 프로젝트</p></div>
          <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"><Plus size={16} />새 프로젝트</Link>
        </div>
        {!projects?.length ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 mb-4">아직 프로젝트가 없습니다</p>
            <Link href="/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus size={16} />첫 프로젝트 만들기</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => {
              const s = PROJECT_STATUS_LABELS[p.status] || PROJECT_STATUS_LABELS.draft
              return (
                <Link key={p.id} href={`/projects/${p.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3"><h3 className="font-medium text-gray-900 text-sm line-clamp-1">{p.name}</h3><span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span></div>
                  <p className="text-xs text-gray-500 mb-2">{spaceLabel(p.space_type)}</p>
                  <p className="text-xs text-gray-400">{new Date(p.updated_at).toLocaleDateString('ko-KR')}</p>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
