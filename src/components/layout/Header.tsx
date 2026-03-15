'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings, FolderOpen, Menu, X } from 'lucide-react'

export function Header({ displayName }: { displayName: string | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); router.refresh() }
  const navigate = (path: string) => { setMenuOpen(false); router.push(path) }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <h1 className="text-lg font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/dashboard')}>SketchFlow</h1>
          <nav className="hidden sm:flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"><FolderOpen size={16} />프로젝트</button>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">{displayName}</span>
          <button onClick={() => navigate('/settings')} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 hidden sm:block" title="설정"><Settings size={18} /></button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 hidden sm:block" title="로그아웃"><LogOut size={18} /></button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 sm:hidden" aria-label="메뉴">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 mt-3 pt-3 pb-1 space-y-1">
          {displayName && <p className="px-3 py-2 text-sm text-gray-500">{displayName}</p>}
          <button onClick={() => navigate('/dashboard')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"><FolderOpen size={16} />프로젝트</button>
          <button onClick={() => navigate('/settings')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"><Settings size={16} />설정</button>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"><LogOut size={16} />로그아웃</button>
        </div>
      )}
    </header>
  )
}
