'use client'
import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'

export function EditableField({ value, fieldPath, projectId, onSave, className = '' }: {
  value: string; fieldPath: string; projectId: string; onSave?: (v: string) => void; className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const handleSave = async () => {
    if (editValue === value) { setEditing(false); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/analysis/edit`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_path: fieldPath, new_value: editValue }),
      })
      if (res.ok) { onSave?.(editValue); setEditing(false) }
    } catch { setEditValue(value) }
    finally { setSaving(false) }
  }

  if (!editing) return (
    <span className={`group cursor-pointer inline-flex items-center gap-1 ${className}`} onClick={() => setEditing(true)} title="클릭하여 수정">
      <span>{value || '(비어있음)'}</span>
      <Pencil size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  )

  return (
    <div className="flex items-center gap-1">
      <input ref={ref} type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditValue(value); setEditing(false) } }}
        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" disabled={saving} />
      <button onClick={handleSave} disabled={saving} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check size={14} /></button>
      <button onClick={() => { setEditValue(value); setEditing(false) }} disabled={saving} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X size={14} /></button>
    </div>
  )
}
