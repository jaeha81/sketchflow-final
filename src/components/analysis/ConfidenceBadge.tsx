import { Badge } from '@/components/ui/Badge'
import type { ConfidenceLevel } from '@/types/database'

const map: Record<ConfidenceLevel, { label: string; variant: string }> = {
  high: { label: '확인됨', variant: 'success' },
  medium: { label: '추정', variant: 'warning' },
  low: { label: '불확실', variant: 'error' },
  inferred: { label: 'AI 추론', variant: 'info' },
}

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const info = map[confidence] || map.low
  return <Badge variant={info.variant}>{info.label}</Badge>
}
