-- 007_design_analysis.sql
-- 디자인 분석 결과 컬럼 추가 (코드변환 포함)

ALTER TABLE public.analysis_results
ADD COLUMN IF NOT EXISTS design_analysis JSONB NOT NULL DEFAULT '{}'::jsonb;
