import type { ConfidenceLevel, MissingInfoPriority } from './database'

export interface SpatialZone {
  id: string; name: string; name_ko: string; type: string
  position: string; estimated_area_m2: number | null
  confidence: ConfidenceLevel; elements: string[]
}

export interface SpatialElement {
  id: string
  type: 'wall' | 'door' | 'window' | 'counter' | 'furniture' | 'storage' | 'fixture' | 'other'
  subtype: string; position_description: string; confidence: ConfidenceLevel
}

export interface SpatialSummary {
  text: string; text_ko: string; zones: SpatialZone[]
  elements: SpatialElement[]; overall_confidence: ConfidenceLevel
}

export interface MissingInfoItem {
  id: string; category: string; description: string; description_ko: string
  priority: MissingInfoPriority; affects: string[]
}

export interface MissingInfo { items: MissingInfoItem[] }

export type ConstructionCode =
  | 'DEMO' | 'PART' | 'CEIL' | 'ELEC' | 'LIGHT'
  | 'FLOOR' | 'FURN' | 'PAINT' | 'SIGN' | 'PLUMB' | 'HVAC' | 'OTHER'

export interface ConstructionItem {
  name: string; name_ko: string; unit: string; note: string
}

export interface ConstructionCategory {
  code: ConstructionCode; name: string; name_ko: string
  scope: string; scope_ko: string; confidence: ConfidenceLevel
  items: ConstructionItem[]
}

export interface ConstructionCategories { categories: ConstructionCategory[] }

export interface EstimateItem {
  id: string; category_code: ConstructionCode; name: string; name_ko: string
  unit: string; estimated_quantity: number | null; note: string
}

export interface EstimateItems { items: EstimateItem[] }

export interface ClientSummary {
  text: string; text_ko: string
  confirmed_items: string[]; pending_items: string[]
}

export interface ColorSwatch {
  role: string; name: string; hex: string; usage: string
}

export interface MaterialSuggestion {
  area: string; material: string; reason: string
}

export interface DesignAnalysis {
  style_concept: string
  mood: string
  color_palette: ColorSwatch[]
  materials: MaterialSuggestion[]
  layout_html: string
  layout_css: string
}

export interface TokenUsage {
  input_tokens: number; output_tokens: number; total_cost_usd: number
}

export interface AIAnalysisResponse {
  spatial_summary: SpatialSummary; missing_info: MissingInfo
  construction_categories: ConstructionCategories
  estimate_items: EstimateItems; client_summary: ClientSummary
  design_analysis: DesignAnalysis
}
