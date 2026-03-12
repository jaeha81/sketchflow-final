'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings, FolderOpen } from 'lucide-react'

export function Header({ displayName }: { displayName: string | null }) {
  const router = useRouter()
  const supabase = createClient()
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold text-gray-900 cursor-pointer" onClick={() => router.push('/dashboard')}>SketchFlow</h1>
          <nav className="hidden sm:flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"><FolderOpen size={16} />프로젝트</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">{displayName}</span>
          <button onClick={() => router.push('/settings')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="설정"><Settings size={18} /></button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="로그아웃"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  )
}
