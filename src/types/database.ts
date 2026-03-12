export type SpaceType =
  | 'office' | 'cafe' | 'retail' | 'clinic'
  | 'restaurant' | 'warehouse' | 'showroom' | 'other'

export type ProjectStatus = 'draft' | 'analyzing' | 'completed' | 'error'
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'inferred'
export type MissingInfoPriority = 'critical' | 'high' | 'medium' | 'low'

export interface Profile {
  id: string
  display_name: string | null
  company_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  space_type: SpaceType
  rough_area_m2: number | null
  text_notes: string | null
  status: ProjectStatus
  sketch_url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface ProjectPhoto {
  id: string
  project_id: string
  photo_url: string
  label: string | null
  sort_order: number
  created_at: string
}

export interface AnalysisResult {
  id: string
  project_id: string
  version: number
  ai_provider: string
  ai_model: string
  raw_ai_response: unknown
  spatial_summary: Record<string, unknown>
  missing_info: Record<string, unknown>
  construction_categories: Record<string, unknown>
  estimate_items: Record<string, unknown>
  client_summary: Record<string, unknown>
  is_current: boolean
  processing_time_ms: number | null
  token_usage: Record<string, unknown> | null
  created_at: string
}
