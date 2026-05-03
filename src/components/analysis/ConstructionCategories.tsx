'use client'
import { useState } from 'react'
import type { ConstructionCategories as T } from '@/types/analysis'
import { ConfidenceBadge } from './ConfidenceBadge'
import { ChevronDown, ChevronRight } from 'lucide-react'

export function ConstructionCategories({ data }: { data: T }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(data.categories.map(c => c.code)))
  const toggle = (code: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(code)) { n.delete(code) } else { n.add(code) }; return n })

  if (!data.categories.length) return <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"><p className="text-gray-500 text-sm">감지된 공종이 없습니다.</p></div>

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">스케치 분석을 기반으로 추정된 공종 목록입니다. 실제 시공 범위는 현장 확인 후 확정됩니다.</p>
      {data.categories.map(cat => {
        const open = expanded.has(cat.code)
        return (
          <div key={cat.code} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => toggle(cat.code)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span className="text-sm font-medium text-gray-900">[{cat.code}] {cat.name_ko || cat.name}</span>
              </div>
              <div className="flex items-center gap-2"><span className="text-xs text-gray-400">{cat.items.length}개 항목</span><ConfidenceBadge confidence={cat.confidence} /></div>
            </button>
            {open && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mt-3 mb-3">{cat.scope_ko || cat.scope}</p>
                {cat.items.length > 0 && (
                  <table className="w-full text-xs">
                    <thead><tr className="text-gray-500 border-b border-gray-100"><th className="text-left py-2 font-medium">항목</th><th className="text-left py-2 font-medium w-16">단위</th><th className="text-left py-2 font-medium">비고</th></tr></thead>
                    <tbody>{cat.items.map((item, j) => <tr key={j} className="border-b border-gray-50"><td className="py-2 text-gray-800">{item.name_ko || item.name}</td><td className="py-2 text-gray-500">{item.unit}</td><td className="py-2 text-gray-500">{item.note}</td></tr>)}</tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
