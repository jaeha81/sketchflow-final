import { z } from 'zod'
import { SPACE_TYPES, ACCEPTED_IMAGE_TYPES, MAX_SKETCH_SIZE_MB } from './constants'

const spaceTypeValues = SPACE_TYPES.map(t => t.value)

export const createProjectSchema = z.object({
  name: z.string().min(1, '프로젝트명을 입력해주세요').max(100),
  space_type: z.enum(spaceTypeValues as [string, ...string[]]),
  rough_area_m2: z.number().positive().optional().nullable(),
  text_notes: z.string().max(2000).optional().nullable(),
})

export const updateProjectSchema = createProjectSchema.partial()

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return '지원하지 않는 이미지 형식입니다. JPG, PNG, WebP, HEIC를 사용해주세요.'
  }
  if (file.size > MAX_SKETCH_SIZE_MB * 1024 * 1024) {
    return `파일 크기가 ${MAX_SKETCH_SIZE_MB}MB를 초과합니다.`
  }
  return null
}
