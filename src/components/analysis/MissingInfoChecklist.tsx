import type { MissingInfo } from '@/types/analysis'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const cfg: Record<string, { icon: typeof Info; color: string; bg: string; variant: string; label: string }> = {
  critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', variant: 'error', label: '필수' },
  high: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', variant: 'warning', label: '중요' },
  medium: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', variant: 'info', label: '권장' },
  low: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-50', variant: 'default', label: '참고' },
}

export function MissingInfoChecklist({ data }: { data: MissingInfo }) {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const sorted = [...data.items].sort((a, b) => (order[a.priority] ?? 4) - (order[b.priority] ?? 4))

  if (!sorted.length) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p className="text-green-700 text-sm">미확인 정보가 감지되지 않았습니다.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">시공 및 견적 진행을 위해 아래 항목들의 확인이 필요합니다.</p>
      {sorted.map(item => {
        const c = cfg[item.priority] || cfg.low; const Icon = c.icon
        return (
          <div key={item.id} className={`rounded-xl border border-gray-200 p-4 ${c.bg}`}>
            <div className="flex items-start gap-3">
              <Icon size={18} className={`${c.color} mt-0.5 shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><Badge variant={c.variant}>{c.label}</Badge><span className="text-xs text-gray-500">{item.category}</span></div>
                <p className="text-sm text-gray-800">{item.description_ko || item.description}</p>
                {item.affects.length > 0 && <p className="text-xs text-gray-500 mt-1">영향: {item.affects.join(', ')}</p>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
