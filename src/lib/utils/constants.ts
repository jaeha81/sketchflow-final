export const SPACE_TYPES = [
  { value: 'office', label: '오피스', label_en: 'Office' },
  { value: 'cafe', label: '카페', label_en: 'Cafe' },
  { value: 'retail', label: '소매점', label_en: 'Retail' },
  { value: 'clinic', label: '병원/클리닉', label_en: 'Clinic' },
  { value: 'restaurant', label: '레스토랑', label_en: 'Restaurant' },
  { value: 'warehouse', label: '창고/물류', label_en: 'Warehouse' },
  { value: 'showroom', label: '쇼룸', label_en: 'Showroom' },
  { value: 'other', label: '기타', label_en: 'Other' },
] as const

export const PROJECT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: '초안', color: 'bg-gray-100 text-gray-700' },
  analyzing: { label: '분석 중', color: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', color: 'bg-green-100 text-green-700' },
  error: { label: '오류', color: 'bg-red-100 text-red-700' },
}

export const CONSTRUCTION_CATEGORIES = [
  { code: 'DEMO', name: 'Demolition', name_ko: '철거공사' },
  { code: 'PART', name: 'Partition/Wall', name_ko: '경량벽체공사' },
  { code: 'CEIL', name: 'Ceiling', name_ko: '천장공사' },
  { code: 'ELEC', name: 'Electrical', name_ko: '전기공사' },
  { code: 'LIGHT', name: 'Lighting', name_ko: '조명공사' },
  { code: 'FLOOR', name: 'Flooring', name_ko: '바닥공사' },
  { code: 'FURN', name: 'Furniture/Joinery', name_ko: '가구/목공사' },
  { code: 'PAINT', name: 'Painting', name_ko: '도장공사' },
  { code: 'SIGN', name: 'Signage', name_ko: '사인공사' },
  { code: 'PLUMB', name: 'Plumbing', name_ko: '설비공사' },
  { code: 'HVAC', name: 'HVAC', name_ko: '공조공사' },
  { code: 'OTHER', name: 'Other', name_ko: '기타공사' },
] as const

export const MAX_SKETCH_SIZE_MB = 10
export const MAX_PHOTO_COUNT = 5
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
