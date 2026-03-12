-- 005_user_edits.sql

CREATE TABLE public.user_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL,
  original_value JSONB,
  new_value JSONB NOT NULL,
  edited_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_edits_analysis_id ON public.user_edits(analysis_id);

ALTER TABLE public.user_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_edits_select_own" ON public.user_edits
  FOR SELECT USING (edited_by = auth.uid());
CREATE POLICY "user_edits_insert_own" ON public.user_edits
  FOR INSERT WITH CHECK (edited_by = auth.uid());
