import type { SpatialSummary as T } from '@/types/analysis'
import { ConfidenceBadge } from './ConfidenceBadge'
import { EditableField } from './EditableField'
import { MapPin, Layers } from 'lucide-react'

export function SpatialSummary({ data, projectId }: { data: T; projectId: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">레이아웃 해석</h3>
          <ConfidenceBadge confidence={data.overall_confidence} />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{data.text_ko || data.text}</p>
      </div>
      {data.zones.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Layers size={16} />감지된 구역 ({data.zones.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.zones.map((z, i) => (
              <div key={z.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <EditableField value={z.name_ko || z.name} fieldPath={`spatial_summary.zones[${i}].name_ko`} projectId={projectId} className="font-medium text-gray-900 text-sm" />
                  <ConfidenceBadge confidence={z.confidence} />
                </div>
                <p className="text-xs text-gray-500">유형: {z.type} · 위치: {z.position}</p>
                {z.estimated_area_m2 && <p className="text-xs text-gray-500">추정 면적: {z.estimated_area_m2}m²</p>}
                {z.elements.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{z.elements.map((el, j) => <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{el}</span>)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      {data.elements.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><MapPin size={16} />감지된 요소 ({data.elements.length})</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.elements.map(el => (
              <div key={el.id} className="px-4 py-3 flex items-center justify-between">
                <div><span className="text-sm text-gray-900">{el.type} — {el.subtype}</span><p className="text-xs text-gray-500">{el.position_description}</p></div>
                <ConfidenceBadge confidence={el.confidence} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
