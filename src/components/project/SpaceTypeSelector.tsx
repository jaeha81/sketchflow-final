'use client'
import { SPACE_TYPES } from '@/lib/utils/constants'

export function SpaceTypeSelector({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">공간 유형 <span className="text-red-500">*</span></label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SPACE_TYPES.map(t => (
          <button key={t.value} type="button" onClick={() => onChange(t.value)} disabled={disabled}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${value === t.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
