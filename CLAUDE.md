# CLAUDE.md — SketchFlow 프로젝트

## 프로젝트 개요
SketchFlow는 러프 인테리어 스케치를 구조화된 시공 워크플로우 데이터로 변환하는 웹 애플리케이션입니다.
스케치 업로드 → AI 분석 → 공간 요약, 미확인 정보, 공종 분류, 견적 항목, 고객 요약 5개 출력물을 생성합니다.

## 기술 스택
- Frontend: Next.js 16 (App Router, TypeScript, Tailwind CSS, Turbopack)
- Backend: Next.js API Routes (별도 서버 없음)
- Database: Supabase (PostgreSQL + Storage + Auth + RLS)
- AI Engine: Claude Sonnet 4.6 (Anthropic API)
- Deployment: Vercel + Supabase Cloud

## 프로젝트 구조
```
sketchflow/
├── CLAUDE.md                         ← 이 파일
├── .env.local                        ← Supabase 키, Anthropic API 키
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
│
├── supabase/migrations/              ← DB 스키마 (6개 SQL 파일)
│   ├── 001_profiles.sql
│   ├── 002_projects.sql
│   ├── 003_project_photos.sql
│   ├── 004_analysis_results.sql
│   ├── 005_user_edits.sql
│   └── 006_storage.sql
│
├── src/
│   ├── middleware.ts                  ← Auth 미들웨어 (세션 갱신 + 라우트 보호)
│   ├── types/                        ← TypeScript 타입 정의
│   │   ├── database.ts               ← DB 테이블 타입
│   │   ├── analysis.ts               ← AI 분석 결과 타입 (5개 출력물 구조)
│   │   └── project.ts                ← 프로젝트 관련 타입
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← 브라우저용 Supabase 클라이언트
│   │   │   ├── server.ts             ← 서버용 Supabase 클라이언트
│   │   │   └── middleware.ts         ← 세션 갱신 + 라우트 보호 로직
│   │   ├── ai/
│   │   │   ├── provider.ts           ← AI 프로바이더 인터페이스 + 팩토리
│   │   │   ├── claude.ts             ← Claude API 호출 구현
│   │   │   ├── prompt.ts             ← 스케치 분석 프롬프트 템플릿
│   │   │   └── parser.ts             ← AI 응답 JSON 파싱 + Zod 검증
│   │   ├── storage/
│   │   │   └── upload.ts             ← Supabase Storage 파일 업로드 헬퍼
│   │   └── utils/
│   │       ├── cn.ts                 ← clsx + tailwind-merge 유틸리티
│   │       ├── constants.ts          ← 공간 유형, 프로젝트 상태, 공종 코드 상수
│   │       └── validation.ts         ← Zod 스키마 (프로젝트 생성/수정, 파일 검증)
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   └── Badge.tsx             ← 범용 배지 컴포넌트
│   │   ├── layout/
│   │   │   └── Header.tsx            ← 앱 헤더 (네비게이션 + 로그아웃)
│   │   ├── project/
│   │   │   ├── SketchUploader.tsx    ← 드래그앤드롭 스케치 업로드
│   │   │   ├── SpaceTypeSelector.tsx ← 공간 유형 선택 (오피스/카페/소매 등)
│   │   │   ├── AnalyzeButton.tsx     ← AI 분석 시작 버튼 (로딩 상태 관리)
│   │   │   └── ProjectResultTabs.tsx ← 5개 탭 결과 표시 컨테이너
│   │   └── analysis/
│   │       ├── ConfidenceBadge.tsx   ← 신뢰도 배지 (확인됨/추정/불확실/AI추론)
│   │       ├── EditableField.tsx     ← 인라인 편집 컴포넌트
│   │       ├── SpatialSummary.tsx    ← 탭1: 공간 요약 (구역 + 요소 목록)
│   │       ├── MissingInfoChecklist.tsx ← 탭2: 미확인 정보 체크리스트
│   │       ├── ConstructionCategories.tsx ← 탭3: 공종 분류 (접기/펼치기)
│   │       ├── EstimateItems.tsx     ← 탭4: 견적 항목 초안
│   │       └── ClientSummary.tsx     ← 탭5: 고객 요약
│   │
│   └── app/
│       ├── globals.css
│       ├── layout.tsx                ← 루트 레이아웃 (lang="ko")
│       ├── page.tsx                  ← / → /login 또는 /dashboard 리다이렉트
│       ├── login/page.tsx            ← 로그인 페이지
│       ├── register/page.tsx         ← 회원가입 페이지
│       ├── dashboard/page.tsx        ← 프로젝트 목록 대시보드
│       ├── settings/page.tsx         ← 사용자 설정
│       ├── projects/
│       │   ├── new/page.tsx          ← 새 프로젝트 생성 (폼 + 업로드)
│       │   └── [id]/page.tsx         ← 프로젝트 결과 페이지 (상태별 분기 + 5탭)
│       └── api/
│           └── projects/
│               ├── route.ts          ← GET 목록, POST 생성
│               └── [id]/
│                   ├── route.ts      ← GET 상세, PATCH 수정, DELETE 삭제
│                   ├── sketch/route.ts  ← POST 스케치 업로드
│                   ├── photos/route.ts  ← POST 사진 업로드, DELETE 삭제
│                   ├── analyze/route.ts ← POST AI 분석 실행
│                   └── analysis/
│                       ├── route.ts     ← GET 분석 결과 조회
│                       └── edit/route.ts ← PATCH 필드 수정
```

## 데이터베이스 스키마

### profiles (auth.users와 1:1)
- id (UUID, PK, FK→auth.users)
- display_name, company_name, phone
- created_at, updated_at

### projects
- id (UUID, PK)
- user_id (FK→profiles)
- name, space_type, rough_area_m2, text_notes
- status: 'draft' | 'analyzing' | 'completed' | 'error'
- sketch_url (Storage 경로)
- error_message

### project_photos
- id, project_id (FK→projects)
- photo_url, label, sort_order

### analysis_results
- id, project_id (FK→projects)
- version, ai_provider, ai_model
- spatial_summary (JSONB), missing_info (JSONB)
- construction_categories (JSONB), estimate_items (JSONB)
- client_summary (JSONB)
- is_current (boolean), processing_time_ms, token_usage (JSONB)
- 트리거: 새 분석 삽입 시 이전 is_current=false

### user_edits
- id, analysis_id (FK→analysis_results)
- field_path, original_value, new_value, edited_by

### Storage
- 버킷: project-files (private, 10MB 제한)
- 경로: {userId}/{projectId}/sketch/ 또는 /photos/
- RLS: 자기 폴더만 접근 가능

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/projects | 프로젝트 목록 |
| POST | /api/projects | 프로젝트 생성 |
| GET | /api/projects/:id | 프로젝트 상세 (분석 결과 포함) |
| PATCH | /api/projects/:id | 프로젝트 수정 |
| DELETE | /api/projects/:id | 프로젝트 삭제 |
| POST | /api/projects/:id/sketch | 스케치 이미지 업로드 |
| POST | /api/projects/:id/photos | 현장 사진 업로드 |
| DELETE | /api/projects/:id/photos?photoId=xxx | 사진 삭제 |
| POST | /api/projects/:id/analyze | AI 분석 실행 |
| GET | /api/projects/:id/analysis | 최신 분석 결과 조회 |
| PATCH | /api/projects/:id/analysis/edit | 분석 결과 필드 수정 |

## AI 분석 파이프라인
1. 스케치 이미지를 Supabase Storage에서 다운로드 → base64 변환
2. 현장 사진도 있으면 최대 3장까지 base64 변환
3. 프롬프트 조립 (src/lib/ai/prompt.ts) — 공간유형, 면적, 메모 포함
4. Claude Sonnet 4.6 API 호출 (이미지 + 텍스트)
5. 응답 JSON 파싱 + Zod 검증 (src/lib/ai/parser.ts)
6. 검증된 결과를 analysis_results 테이블에 저장
7. 프로젝트 status를 'completed'로 변경

## 핵심 규칙
- 모든 AI 출력은 "추정(inferred)" 또는 "확인됨(confirmed)"으로 표시
- 치수를 임의 생성하지 않음 — 없으면 missing_info에 포함
- 공종 분류는 한국 인테리어 실무 기준 (철거, 경량벽체, 천장, 전기, 조명, 바닥, 가구/목공, 도장, 사인, 설비, 공조)
- 고객 요약은 비전문가가 이해할 수 있는 쉬운 한국어

## 코딩 규칙
- TypeScript strict mode
- Server Component 기본, 'use client'는 인터랙션 필요한 곳만
- Supabase RLS로 데이터 접근 제어 (코드에서 user_id 필터 불필요하나 명시적으로도 작성)
- Zod로 입력 검증 (API 라우트, AI 응답)
- Tailwind CSS 유틸리티 클래스 사용 (별도 CSS 파일 없음)

---

## 작업 이력 (Claude/Codex 인계용)

### 2026-05-03 — Zod 검증 에러 수정 (커밋 `83c5b73`, `b3ff48f`)

**수정한 문제들:**
1. `src/lib/ai/parser.ts` — Zod schema에 `.default()` 누락으로 검증 크래시 발생
   - `spatial_summary.elements[].position_description` 등 required string 필드에 `.default('')` 추가
   - top-level object 6개 필드 전부에 `.default({...})` 추가 (없으면 전체 undefined 처리됨)
2. `src/lib/ai/claude.ts` — `cache_control` 적용 전 빈 text block 필터링 추가 (API 400 방지)

---

### 🔴 현재 미해결 이슈 [P1] — 분석 결과 데이터 빈 상태 표시

**증상:** 에러는 없으나 분석 완료 후 5개 탭에 아무 데이터도 표시 안 됨

**의심 원인:**
- Zod `.default()` 추가로 스키마가 완전히 관대해져서, Claude가 빈 응답 반환 시 에러 대신 모두 빈값으로 채워지는 부작용
- 실제 원인은 Claude가 `toolBlock.input`을 비워서 반환하는 것일 가능성 높음

**디버그 로그 추가됨 (커밋 `404b64a`):**
`src/lib/ai/claude.ts` `toOutput()` 메서드에 아래 로그가 임시 추가된 상태:
```
console.error('[DEBUG] stop_reason:', message.stop_reason)
console.error('[DEBUG] content blocks:', ...)
console.error('[DEBUG] toolBlock.input (first 2000):', ...)
```

**다음 세션 할 일:**
1. sketchflow-final.vercel.app에서 분석 실행
2. Vercel Dashboard → Functions → Runtime Logs → `[DEBUG]` 로그 확인
3. `stop_reason`이 `tool_use`가 아니거나 `toolBlock.input`이 비어있으면 → 프롬프트 or 모델 파라미터 문제
4. `toolBlock.input`에 데이터 있으면 → 파싱/저장/표시 로직 문제
5. 원인 수정 후 디버그 로그 제거 (`console.error` 3줄 삭제)

**관련 파일:**
- `src/lib/ai/claude.ts` — `toOutput()` 메서드 (L127~)
- `src/lib/ai/parser.ts` — Zod 검증 스키마
- `src/lib/ai/pipeline.ts` — `raw_ai_response` Supabase 저장 (진단에 활용 가능)
