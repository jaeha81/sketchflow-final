# SketchFlow

러프 인테리어 스케치를 시공 워크플로우 데이터로 변환하는 웹 애플리케이션

## 주요 기능

- **스케치 업로드**: 손그림 스케치 이미지를 업로드 (JPG, PNG, WebP, HEIC)
- **AI 분석**: Claude Vision이 스케치를 분석하여 구조화된 데이터 생성
- **5가지 출력물**: 공간 요약, 미확인 정보, 공종 분류, 견적 항목, 고객 요약
- **인라인 편집**: 모든 AI 출력을 직접 수정 가능
- **신뢰도 표시**: 각 판단에 high/medium/low 신뢰도 배지

## 기술 스택

- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Supabase (PostgreSQL, Storage, Auth, RLS)
- Claude Sonnet 4.6 (Anthropic API)

## 시작하기

```bash
npm install
# .env.local에 Supabase 키 + Anthropic API 키 입력
npm run dev
```

상세 설정: [SETUP-GUIDE.md](./SETUP-GUIDE.md)
프로젝트 구조: [CLAUDE.md](./CLAUDE.md)

---

## 📊 개발 현황 <!-- jh-progress -->

| 항목 | 내용 |
|------|------|
| **진행률** | `███████████████████░` **98%** |
| **레포** | [sketchflow-final](https://github.com/jaeha81/sketchflow-final) |

> 진행률: 98%
