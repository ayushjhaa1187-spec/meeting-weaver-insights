
-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  accuracy NUMERIC,
  latency NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'email',
  size_bytes BIGINT,
  status TEXT NOT NULL DEFAULT 'uploaded',
  relevance_score NUMERIC,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- BRDs table
CREATE TABLE public.brds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version INT NOT NULL DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  accuracy NUMERIC,
  precision_score NUMERIC,
  recall NUMERIC,
  f1_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'generating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brds" ON public.brds FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pipeline logs
CREATE TABLE public.pipeline_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INT DEFAULT 0,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own logs" ON public.pipeline_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Metrics table
CREATE TABLE public.metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own metrics" ON public.metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for pipeline_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_logs;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_brds_updated_at BEFORE UPDATE ON public.brds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
