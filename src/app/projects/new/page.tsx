'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SketchUploader } from '@/components/project/SketchUploader'
import { SpaceTypeSelector } from '@/components/project/SpaceTypeSelector'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState(''); const [spaceType, setSpaceType] = useState(''); const [roughArea, setRoughArea] = useState('')
  const [textNotes, setTextNotes] = useState(''); const [sketchFile, setSketchFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null)
  const canSubmit = name.trim() && spaceType && sketchFile && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!canSubmit) return; setError(null); setLoading(true)
    try {
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), space_type: spaceType, rough_area_m2: roughArea ? parseFloat(roughArea) : null, text_notes: textNotes.trim() || null }) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || '프로젝트 생성 실패') }
      const { project } = await res.json()
      const fd = new FormData(); fd.append('file', sketchFile!)
      const upRes = await fetch(`/api/projects/${project.id}/sketch`, { method: 'POST', body: fd })
      if (!upRes.ok) throw new Error('스케치 업로드 실패')
      router.push(`/projects/${project.id}`)
    } catch (err) { setError(err instanceof Error ? err.message : '오류'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3"><div className="max-w-2xl mx-auto flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-bold text-gray-900">새 프로젝트</h1>
      </div></header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">프로젝트명 <span className="text-red-500">*</span></label>
            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required maxLength={100} disabled={loading} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="예: 강남 OO빌딩 3층 오피스" /></div>
          <SpaceTypeSelector value={spaceType} onChange={setSpaceType} disabled={loading} />
          <SketchUploader onFileSelect={setSketchFile} currentFile={sketchFile} disabled={loading} />
          <div><label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">대략적 면적 (선택)</label>
            <div className="relative w-full sm:w-48"><input id="area" type="number" value={roughArea} onChange={e => setRoughArea(e.target.value)} disabled={loading} min="0" step="0.1" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">m²</span></div></div>
          <div><label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
            <textarea id="notes" value={textNotes} onChange={e => setTextNotes(e.target.value)} disabled={loading} maxLength={2000} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" placeholder="현장 특이사항, 고객 요구사항 등" />
            <p className="text-xs text-gray-400 mt-1">{textNotes.length}/2000</p></div>
          <div className="pt-4 border-t border-gray-200">
            <button type="submit" disabled={!canSubmit} className="w-full py-3 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" />프로젝트 생성 중...</> : '프로젝트 생성'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
