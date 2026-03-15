'use client'
import { useState } from 'react'
import type { AnalysisResult } from '@/types/database'
import type { SpatialSummary as ST, MissingInfo as MI, ConstructionCategories as CC, EstimateItems as EI, ClientSummary as CS } from '@/types/analysis'
import { SpatialSummary } from '@/components/analysis/SpatialSummary'
import { MissingInfoChecklist } from '@/components/analysis/MissingInfoChecklist'
import { ConstructionCategories } from '@/components/analysis/ConstructionCategories'
import { EstimateItems } from '@/components/analysis/EstimateItems'
import { ClientSummary } from '@/components/analysis/ClientSummary'
import { cn } from '@/lib/utils/cn'

const TABS = [
  { id: 'summary', label: '공간 요약' },
  { id: 'missing', label: '미확인 정보' },
  { id: 'categories', label: '공종 분류' },
  { id: 'estimate', label: '견적 항목' },
  { id: 'client', label: '고객 요약' },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProjectResultTabs({ analysis, projectId }: { analysis: AnalysisResult; projectId: string }) {
  const [tab, setTab] = useState<TabId>('summary')
  const missingCount = ((analysis.missing_info as unknown as MI)?.items?.length) || 0
  const tu = analysis.token_usage as unknown as { total_cost_usd?: number } | null

  return (
    <div>
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')}>
            {t.label}
            {t.id === 'missing' && missingCount > 0 && <span className="ml-1 sm:ml-1.5 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-xs bg-red-500 text-white rounded-full">{missingCount}</span>}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-400 mb-4 flex items-center gap-3 flex-wrap">
        <span>v{analysis.version}</span><span>·</span><span>{analysis.ai_model}</span>
        {analysis.processing_time_ms && <><span>·</span><span>{(analysis.processing_time_ms / 1000).toFixed(1)}초</span></>}
        {tu?.total_cost_usd && <><span>·</span><span>${tu.total_cost_usd.toFixed(4)}</span></>}
      </div>
      {tab === 'summary' && <SpatialSummary data={analysis.spatial_summary as unknown as ST} projectId={projectId} />}
      {tab === 'missing' && <MissingInfoChecklist data={analysis.missing_info as unknown as MI} />}
      {tab === 'categories' && <ConstructionCategories data={analysis.construction_categories as unknown as CC} />}
      {tab === 'estimate' && <EstimateItems data={analysis.estimate_items as unknown as EI} />}
      {tab === 'client' && <ClientSummary data={analysis.client_summary as unknown as CS} />}
    </div>
  )
}
