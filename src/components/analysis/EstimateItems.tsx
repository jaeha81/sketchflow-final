import type { EstimateItems as T } from '@/types/analysis'
import { CONSTRUCTION_CATEGORIES } from '@/lib/utils/constants'

export function EstimateItems({ data }: { data: T }) {
  const grouped = data.items.reduce((acc, item) => { (acc[item.category_code] ??= []).push(item); return acc }, {} as Record<string, typeof data.items>)
  const catLabel = (code: string) => CONSTRUCTION_CATEGORIES.find(c => c.code === code)?.name_ko || code

  if (!data.items.length) return <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"><p className="text-gray-500 text-sm">견적 항목이 생성되지 않았습니다.</p></div>

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">아래 견적 항목은 AI가 스케치를 기반으로 추정한 초안입니다. 실제 견적은 현장 실측 및 자재 확정 후 작성되어야 합니다.</p>
      </div>
      {Object.entries(grouped).map(([code, items]) => (
        <div key={code} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200"><h4 className="text-sm font-medium text-gray-900">[{code}] {catLabel(code)}</h4></div>
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 border-b border-gray-100"><th className="text-left px-4 py-2 font-medium">항목</th><th className="text-left px-4 py-2 font-medium w-16">단위</th><th className="text-right px-4 py-2 font-medium w-20">수량</th><th className="text-left px-4 py-2 font-medium">비고</th></tr></thead>
            <tbody>{items.map(item => (
              <tr key={item.id} className="border-b border-gray-50">
                <td className="px-4 py-2 text-gray-800">{item.name_ko || item.name}</td>
                <td className="px-4 py-2 text-gray-500">{item.unit}</td>
                <td className="px-4 py-2 text-right text-gray-800">{item.estimated_quantity !== null ? item.estimated_quantity : <span className="text-gray-400 text-xs">실측 필요</span>}</td>
                <td className="px-4 py-2 text-gray-500 text-xs">{item.note}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
