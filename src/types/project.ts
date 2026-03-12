import type { Project, ProjectPhoto, AnalysisResult } from './database'

export interface ProjectListItem {
  id: string; name: string; space_type: string; status: string
  sketch_url: string | null; created_at: string; updated_at: string
}

export interface ProjectDetail extends Project {
  photos: ProjectPhoto[]
  current_analysis: AnalysisResult | null
  analysis_count: number
}

export interface CreateProjectInput {
  name: string; space_type: string
  rough_area_m2?: number; text_notes?: string
}
