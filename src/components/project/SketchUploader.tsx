'use client'
import { useState, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import { validateImageFile } from '@/lib/utils/validation'

export function SketchUploader({ onFileSelect, currentFile, disabled }: {
  onFileSelect: (file: File | null) => void; currentFile: File | null; disabled?: boolean
}) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    setError(null)
    const err = validateImageFile(file)
    if (err) { setError(err); return }
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    onFileSelect(file)
  }, [onFileSelect])

  if (preview && currentFile) return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">스케치 이미지 <span className="text-red-500">*</span></label>
      <div className="relative border border-gray-200 rounded-xl overflow-hidden">
        <img src={preview} alt="스케치 미리보기" className="w-full max-h-64 object-contain bg-gray-50" />
        <button type="button" onClick={() => { setPreview(null); onFileSelect(null) }} disabled={disabled} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50"><X size={16} className="text-red-500" /></button>
        <div className="p-2 bg-gray-50 text-xs text-gray-500">{currentFile.name}</div>
      </div>
    </div>
  )

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">스케치 이미지 <span className="text-red-500">*</span></label>
      <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <label className="cursor-pointer">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} disabled={disabled} className="hidden" />
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">스케치 이미지를 드래그하거나 클릭하세요</p>
          <p className="text-xs text-gray-400">JPG, PNG, WebP, HEIC · 최대 10MB</p>
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
