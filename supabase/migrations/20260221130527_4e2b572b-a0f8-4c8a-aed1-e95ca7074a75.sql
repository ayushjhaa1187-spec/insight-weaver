
-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Documents table (uploaded emails, transcripts, chat logs)
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'transcript', 'chat', 'demo')),
  file_name TEXT NOT NULL,
  raw_content TEXT,
  relevance_score REAL DEFAULT 0,
  is_relevant BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON public.documents FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- BRDs table
CREATE TABLE public.brds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_json JSONB DEFAULT '{}',
  accuracy_score REAL,
  precision_score REAL,
  recall_score REAL,
  f1_score REAL,
  latency_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete', 'failed')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own brds" ON public.brds FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- Pipeline jobs table
CREATE TABLE public.pipeline_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  brd_id UUID REFERENCES public.brds(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  current_phase TEXT NOT NULL DEFAULT 'ingestion' CHECK (current_phase IN ('ingestion', 'noise_filtering', 'entity_extraction', 'brd_generation', 'validation', 'complete')),
  progress_pct INTEGER NOT NULL DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own pipeline_jobs" ON public.pipeline_jobs FOR ALL
  USING (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE owner_id = auth.uid()));

-- Enable realtime for pipeline_jobs so frontend can watch progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.brds;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brds_updated_at BEFORE UPDATE ON public.brds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
