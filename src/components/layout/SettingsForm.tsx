'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Check } from 'lucide-react'

interface Props {
  userId: string
  email: string
  displayName: string | null
  companyName: string | null
  phone: string | null
}

export function SettingsForm({ userId, email, displayName, companyName, phone }: Props) {
  const [form, setForm] = useState({
    display_name: displayName || '',
    company_name: companyName || '',
    phone: phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (k: keyof typeof form, v: string) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setSaved(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(null); setSaved(false)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      display_name: form.display_name || null,
      company_name: form.company_name || null,
      phone: form.phone || null,
      updated_at: new Date().toISOString(),
    }).eq('id', userId)
    if (error) setError('저장 중 오류가 발생했습니다.')
    else setSaved(true)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
        <p className="text-sm text-gray-500 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">{email}</p>
      </div>
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
        <input id="display_name" type="text" value={form.display_name} onChange={e => handleChange('display_name', e.target.value)}
          maxLength={50} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="홍길동" />
      </div>
      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
        <input id="company_name" type="text" value={form.company_name} onChange={e => handleChange('company_name', e.target.value)}
          maxLength={100} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="OO인테리어" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
        <input id="phone" type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
          maxLength={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="010-0000-0000" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin" />저장 중...</> : '저장'}
        </button>
        {saved && <span className="text-sm text-green-600 flex items-center gap-1"><Check size={14} />저장되었습니다</span>}
      </div>
    </form>
  )
}
