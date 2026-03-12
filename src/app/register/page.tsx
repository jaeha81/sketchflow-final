'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false)
  const router = useRouter(); const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">SketchFlow</h1>
        <p className="text-gray-500 text-center text-sm mb-8">새 계정 만들기</p>
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <div><label htmlFor="dn" className="block text-sm font-medium text-gray-700 mb-1">이름</label><input id="dn" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="홍길동" /></div>
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="name@company.com" /></div>
          <div><label htmlFor="pw" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label><input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" placeholder="6자 이상" /></div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{loading ? '가입 중...' : '회원가입'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">이미 계정이 있으신가요?{' '}<Link href="/login" className="text-blue-600 hover:underline">로그인</Link></p>
      </div>
    </div>
  )
}
