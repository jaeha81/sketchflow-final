import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { SettingsForm } from '@/components/layout/SettingsForm'

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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SettingsForm
            userId={user.id}
            email={user.email || ''}
            displayName={profile?.display_name ?? null}
            companyName={profile?.company_name ?? null}
            phone={profile?.phone ?? null}
          />
        </div>
      </main>
    </div>
  )
}
