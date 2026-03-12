# SketchFlow — 개발 환경 설정 가이드

> 러프 인테리어 스케치를 시공 워크플로우 데이터로 변환하는 웹 애플리케이션

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS v4) |
| Backend | Next.js API Routes (서버리스) |
| Database | Supabase (PostgreSQL + Storage + Auth + RLS) |
| AI Engine | Claude Sonnet 4.6 (Anthropic API, 비전 포함) |
| Deployment | Vercel + Supabase Cloud |

---

## 사전 준비 (직접 해야 하는 것)

### 1. Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 로그인
2. **New Project** 클릭
3. 프로젝트 이름: `sketchflow`, Region: Northeast Asia (Tokyo)
4. 비밀번호 설정 후 생성 완료 대기

### 2. Supabase 키 확인

대시보드 → **Settings** → **API** 에서:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon (public) key**: `eyJhbGciOi...`

### 3. Anthropic API 키 확인

[https://console.anthropic.com/api-keys](https://console.anthropic.com/api-keys) 에서 키 생성 또는 복사

### 4. Supabase Auth 설정

1. 대시보드 → **Authentication** → **Settings**
2. **Enable email confirmations** 비활성화 권장 (개발 시)
3. **URL Configuration** → Site URL: `http://localhost:3000`

---

## 로컬 개발 환경 설정

### Step 1: 의존성 설치

```bash
npm install
```

### Step 2: 환경변수 설정

`.env.local` 파일을 열고 실제 값으로 교체:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[실제 프로젝트ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[실제 anon key]

# AI
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-[실제 키]

# App
NEXT_PUBLIC_APP_NAME=SketchFlow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Supabase DB 마이그레이션

Supabase 대시보드 → **SQL Editor** 에서 `supabase/migrations/` 폴더 내 SQL 파일을 **순서대로** 실행:

```
001_profiles.sql          → 유저 프로필 테이블 + 자동 생성 트리거
002_projects.sql          → 프로젝트 테이블 + RLS 정책
003_project_photos.sql    → 현장 사진 테이블
004_analysis_results.sql  → AI 분석 결과 테이블 + 버전 관리 트리거
005_user_edits.sql        → 사용자 편집 이력 테이블
006_storage.sql           → Storage 버킷 생성 + RLS 정책
```

> **주의**: `006_storage.sql`은 storage.buckets 테이블에 접근하므로 반드시 SQL Editor에서 실행 (supabase CLI 마이그레이션으로 실행 시 권한 오류 발생 가능)

### Step 4: 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인

---

## 동작 검증 체크리스트

```
1. /register → 테스트 계정 회원가입
2. /login    → 로그인
3. /dashboard → 프로젝트 목록 확인 (빈 상태)
4. "새 프로젝트" 클릭
   - 프로젝트명 입력
   - 공간 유형 선택
   - 스케치 이미지 업로드 (JPG/PNG/WebP/HEIC, 최대 10MB)
5. "프로젝트 생성" → 프로젝트 페이지로 이동
6. "분석 시작" 클릭 → AI 분석 (약 15~30초)
7. 분석 완료 후 5개 탭 결과 확인:
   ✅ 공간 요약 — 구역 및 요소 목록, 인라인 편집 가능
   ✅ 미확인 정보 — 확인 필요 항목 (우선순위별 정렬)
   ✅ 공종 분류 — 한국 인테리어 실무 기준 공종 (접기/펼치기)
   ✅ 견적 항목 — AI 추정 초안 (실측 필요 항목 표시)
   ✅ 고객 요약 — 비전문가용 쉬운 한국어 요약
```

---

## 주요 기능 구조

```
스케치 업로드 (JPG/PNG/WebP/HEIC, 최대 10MB)
    ↓
AI 분석 파이프라인:
  1. Supabase Storage에서 스케치 다운로드 → base64 변환
  2. 현장 사진 (선택, 최대 3장) → base64 변환
  3. Claude Sonnet 4.6 API 호출 (비전 + 텍스트)
  4. JSON 응답 파싱 + Zod 검증
  5. analysis_results 테이블 저장 + is_current 트리거
  6. 프로젝트 status → 'completed'
    ↓
5개 출력물 표시 (인라인 편집 지원)
```

---

## 트러블슈팅

### "인증 필요" 오류 반복
- `.env.local`의 Supabase URL / anon key 재확인
- 브라우저 쿠키 삭제 후 재시도

### 회원가입 후 로그인 안 됨
- Supabase 대시보드 → Authentication → Settings → **Enable email confirmations 비활성화** 확인

### 스케치 업로드 실패
- Supabase Storage에 `project-files` 버킷 존재 여부 확인
- `006_storage.sql` 정상 실행 여부 확인

### AI 분석 실패
- `.env.local`의 `ANTHROPIC_API_KEY` 확인
- [Anthropic 콘솔](https://console.anthropic.com)에서 API 크레딧 잔액 확인
- 터미널 로그에서 구체적 오류 메시지 확인

### profiles 테이블에 유저 row가 없을 때
`001_profiles.sql`의 `handle_new_user` 트리거가 동작하지 않은 경우:
```sql
INSERT INTO profiles (id) VALUES ('[user-uuid]');
```

---

## Vercel 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 배포
vercel

# 3. Vercel 대시보드 → Settings → Environment Variables에 추가:
#    NEXT_PUBLIC_SUPABASE_URL
#    NEXT_PUBLIC_SUPABASE_ANON_KEY
#    ANTHROPIC_API_KEY
#    AI_PROVIDER=claude

# 4. Supabase 대시보드 → Auth → URL Configuration
#    Site URL을 Vercel 배포 URL로 업데이트
```

> **Vercel Hobby 플랜 주의**: API 라우트 기본 timeout 10초. AI 분석(`/api/projects/[id]/analyze`)에 `maxDuration = 60`이 설정되어 있으나 **Pro 플랜에서만 60초 허용**. Hobby 플랜은 최대 10초이므로 분석 실패 가능 → Pro 플랜 권장.

---

## 비용 추정

| 항목 | 무료 티어 | 유료 전환 시점 |
|------|-----------|----------------|
| Vercel | Hobby 무료 | 트래픽 증가 시 $20/월 |
| Supabase | Free (500MB DB, 1GB Storage) | 초과 시 $25/월 |
| Claude API | 사용량 기반 | 분석 1건당 약 $0.01~0.04 |
| 월 100건 분석 시 | ~$1~4/월 | — |

---

## 향후 개발 계획

| 우선순위 | 기능 | 비고 |
|---------|------|------|
| 1 | PDF 내보내기 | 고객 요약 + 공종 + 견적을 PDF로 |
| 2 | 모바일 카메라 캡처 | 현장에서 직접 스케치 촬영 |
| 3 | 네이버/카카오 OAuth | Supabase custom OAuth |
| 4 | 팀 공유 | team_id 기반 접근 제어 |
| 5 | 자동 견적 연동 | 단가 테이블 연결 + 자동 합산 |
