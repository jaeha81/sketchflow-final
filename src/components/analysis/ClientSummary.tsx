import type { ClientSummary as T } from '@/types/analysis'
import { CheckCircle2, CircleDot } from 'lucide-react'

export function ClientSummary({ data }: { data: T }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4"><p className="text-sm text-blue-800">이 요약은 고객에게 직접 보여줄 수 있는 형태로 작성되었습니다.</p></div>
      <div className="bg-white rounded-xl border border-gray-200 p-5"><p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{data.text_ko || data.text}</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2"><CheckCircle2 size={16} />확인된 사항</h4>
          {data.confirmed_items.length ? <ul className="space-y-2">{data.confirmed_items.map((item, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-green-500 mt-1">•</span>{item}</li>)}</ul> : <p className="text-sm text-gray-400">없음</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-orange-700 mb-3 flex items-center gap-2"><CircleDot size={16} />확인 필요 사항</h4>
          {data.pending_items.length ? <ul className="space-y-2">{data.pending_items.map((item, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-orange-500 mt-1">•</span>{item}</li>)}</ul> : <p className="text-sm text-gray-400">없음</p>}
        </div>
      </div>
    </div>
  )
}
