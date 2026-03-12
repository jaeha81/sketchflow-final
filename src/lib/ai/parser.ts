import { z } from 'zod'
import type { AIAnalysisResponse } from '@/types/analysis'

const conf = z.enum(['high', 'medium', 'low', 'inferred'])
const prio = z.enum(['critical', 'high', 'medium', 'low'])

const analysisSchema = z.object({
  spatial_summary: z.object({
    text: z.string(), text_ko: z.string().default(''),
    zones: z.array(z.object({
      id: z.string(), name: z.string(), name_ko: z.string().default(''),
      type: z.string(), position: z.string(),
      estimated_area_m2: z.number().nullable().default(null),
      confidence: conf, elements: z.array(z.string()).default([]),
    })).default([]),
    elements: z.array(z.object({
      id: z.string(),
      type: z.enum(['wall','door','window','counter','furniture','storage','fixture','other']),
      subtype: z.string().default(''), position_description: z.string(), confidence: conf,
    })).default([]),
    overall_confidence: conf,
  }),
  missing_info: z.object({
    items: z.array(z.object({
      id: z.string().default(() => `m_${Date.now()}_${Math.random().toString(36).slice(2,6)}`),
      category: z.string(), description: z.string(), description_ko: z.string().default(''),
      priority: prio, affects: z.array(z.string()).default([]),
    })).default([]),
  }),
  construction_categories: z.object({
    categories: z.array(z.object({
      code: z.string(), name: z.string(), name_ko: z.string().default(''),
      scope: z.string().default(''), scope_ko: z.string().default(''),
      confidence: conf,
      items: z.array(z.object({
        name: z.string(), name_ko: z.string().default(''),
        unit: z.string(), note: z.string().default(''),
      })).default([]),
    })).default([]),
  }),
  estimate_items: z.object({
    items: z.array(z.object({
      id: z.string().default(() => `e_${Date.now()}_${Math.random().toString(36).slice(2,6)}`),
      category_code: z.string(), name: z.string(), name_ko: z.string().default(''),
      unit: z.string(), estimated_quantity: z.number().nullable().default(null),
      note: z.string().default(''),
    })).default([]),
  }),
  client_summary: z.object({
    text: z.string(), text_ko: z.string().default(''),
    confirmed_items: z.array(z.string()).default([]),
    pending_items: z.array(z.string()).default([]),
  }),
})

export function parseAndValidateResponse(responseText: string): AIAnalysisResponse {
  let cleaned = responseText.trim()
  const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) cleaned = m[1].trim()
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last !== -1) cleaned = cleaned.slice(first, last + 1)

  let parsed: unknown
  try { parsed = JSON.parse(cleaned) }
  catch { throw new Error(`JSON 파싱 실패: ${cleaned.slice(0, 200)}...`) }

  const v = analysisSchema.safeParse(parsed)
  if (!v.success) throw new Error(`응답 검증 실패: ${JSON.stringify(v.error.flatten().fieldErrors)}`)
  return v.data as AIAnalysisResponse
}
