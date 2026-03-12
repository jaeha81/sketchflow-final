-- 004_analysis_results.sql

CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  raw_ai_response JSONB,
  spatial_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  missing_info JSONB NOT NULL DEFAULT '{"items":[]}'::jsonb,
  construction_categories JSONB NOT NULL DEFAULT '{"categories":[]}'::jsonb,
  estimate_items JSONB NOT NULL DEFAULT '{"items":[]}'::jsonb,
  client_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_current BOOLEAN NOT NULL DEFAULT true,
  processing_time_ms INT,
  token_usage JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analysis_project_id ON public.analysis_results(project_id);
CREATE INDEX idx_analysis_is_current ON public.analysis_results(project_id, is_current) WHERE is_current = true;

ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_select_own" ON public.analysis_results
  FOR SELECT USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );
CREATE POLICY "analysis_insert_own" ON public.analysis_results
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );
CREATE POLICY "analysis_update_own" ON public.analysis_results
  FOR UPDATE USING (
    project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid())
  );

-- 새 분석 삽입 시, 같은 프로젝트의 이전 결과를 is_current=false로 변경
CREATE OR REPLACE FUNCTION public.handle_new_analysis()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.analysis_results
  SET is_current = false
  WHERE project_id = NEW.project_id AND id != NEW.id AND is_current = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_analysis
  AFTER INSERT ON public.analysis_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_analysis();
