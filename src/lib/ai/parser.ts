import { z } from 'zod'
import type { AIAnalysisResponse } from '@/types/analysis'

const conf = z.enum(['high', 'medium', 'low', 'inferred']).catch('inferred')
const prio = z.enum(['critical', 'high', 'medium', 'low']).catch('medium')

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
      type: z.enum(['wall','door','window','counter','furniture','storage','fixture','other']).catch('other'),
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
  design_analysis: z.object({
    style_concept: z.string().default(''),
    mood: z.string().default(''),
    color_palette: z.array(z.object({
      role: z.string(), name: z.string(),
      hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).catch('#CCCCCC'),
      usage: z.string().default(''),
    })).default([]),
    materials: z.array(z.object({
      area: z.string(), material: z.string(), reason: z.string().default(''),
    })).default([]),
    layout_html: z.string().default(''),
    layout_css: z.string().default(''),
  }).default({
    style_concept: '', mood: '', color_palette: [],
    materials: [], layout_html: '', layout_css: '',
  }),
})

export function parseAndValidateResponse(responseText: string): AIAnalysisResponse {
  let cleaned = responseText.trim()

  // 마크다운 코드블록 제거
  const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (m) cleaned = m[1].trim()

  // JSON 객체 범위 추출 (균형잡힌 중괄호 탐색)
  const first = cleaned.indexOf('{')
  if (first !== -1) {
    let depth = 0
    let end = -1
    for (let i = first; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++
      else if (cleaned[i] === '}') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end !== -1) cleaned = cleaned.slice(first, end + 1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // 제어 문자 제거 후 재시도 (layout_html/css 내 개행 등)
    const sanitized = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    try { parsed = JSON.parse(sanitized) }
    catch { throw new Error(`JSON 파싱 실패: ${cleaned.slice(0, 300)}`) }
  }

  const v = analysisSchema.safeParse(parsed)
  if (!v.success) throw new Error(`응답 검증 실패: ${JSON.stringify(v.error.flatten().fieldErrors)}`)
  return v.data as AIAnalysisResponse
}
