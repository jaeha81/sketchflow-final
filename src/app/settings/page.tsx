import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header displayName={profile?.display_name || user.email || ''} />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">설정</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700">이메일</label><p className="text-sm text-gray-500 mt-1">{user.email}</p></div>
          <div><label className="block text-sm font-medium text-gray-700">이름</label><p className="text-sm text-gray-500 mt-1">{profile?.display_name || '-'}</p></div>
          <div><label className="block text-sm font-medium text-gray-700">회사</label><p className="text-sm text-gray-500 mt-1">{profile?.company_name || '-'}</p></div>
        </div>
      </main>
    </div>
  )
}
