import type { AnalysisInput } from './provider'

export function buildAnalysisPrompt(input: AnalysisInput): string {
  const ctx: string[] = [`공간 유형: ${input.spaceType}`]
  if (input.roughAreaM2) ctx.push(`대략적 면적: ${input.roughAreaM2}m²`)
  if (input.textNotes) ctx.push(`사용자 메모: ${input.textNotes}`)

  return `당신은 15년 이상 경력의 인테리어 시공 전문가이자 현장 감리자입니다.
업로드된 러프 스케치를 분석하고, 실제 인테리어 시공 워크플로우에 필요한 구조화된 데이터를 생성하세요.

## 컨텍스트
${ctx.join('\n')}

## 분석 규칙
1. 스케치에서 직접 확인되지 않는 치수를 절대 임의로 생성하지 마세요.
2. 각 판단에 대해 confidence를 "high", "medium", "low" 중 하나로 표시하세요.
3. 확인할 수 없는 정보는 반드시 missing_info에 포함하세요.
4. 공종 분류는 한국 인테리어 실무 기준을 따르세요.
5. 견적 항목의 단위는 m², m, EA, SET, LOT 중 적절한 것을 사용하세요.
6. 고객 요약은 비전문가가 이해할 수 있는 쉬운 한국어로 작성하세요.

## 응답 형식
반드시 아래 JSON 구조로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요.

{
  "spatial_summary": {
    "text": "Layout interpretation in English",
    "text_ko": "레이아웃 해석 (한국어)",
    "zones": [
      { "id": "zone_1", "name": "Zone Name", "name_ko": "구역명", "type": "reception|office|meeting|pantry|storage|restroom|corridor|other", "position": "위치", "estimated_area_m2": null, "confidence": "high|medium|low", "elements": [] }
    ],
    "elements": [
      { "id": "elem_1", "type": "wall|door|window|counter|furniture|storage|fixture|other", "subtype": "", "position_description": "위치 설명", "confidence": "high|medium|low" }
    ],
    "overall_confidence": "medium"
  },
  "missing_info": {
    "items": [
      { "id": "missing_1", "category": "dimensions|ceiling|lighting|electrical|demolition|material|structural|mechanical|scope", "description": "Description", "description_ko": "설명", "priority": "critical|high|medium|low", "affects": [] }
    ]
  },
  "construction_categories": {
    "categories": [
      { "code": "DEMO|PART|CEIL|ELEC|LIGHT|FLOOR|FURN|PAINT|SIGN|PLUMB|HVAC|OTHER", "name": "Name", "name_ko": "공종명", "scope": "Scope", "scope_ko": "범위", "confidence": "high|medium|low|inferred", "items": [ { "name": "Item", "name_ko": "항목명", "unit": "m²|m|EA|SET|LOT", "note": "" } ] }
    ]
  },
  "estimate_items": {
    "items": [
      { "id": "est_1", "category_code": "DEMO", "name": "Item", "name_ko": "항목명", "unit": "m²", "estimated_quantity": null, "note": "수량은 실측 후 확정" }
    ]
  },
  "client_summary": {
    "text": "Client summary in English",
    "text_ko": "고객 요약 (쉬운 한국어)",
    "confirmed_items": ["확인된 항목"],
    "pending_items": ["확인 필요 항목"]
  }
}`
}
