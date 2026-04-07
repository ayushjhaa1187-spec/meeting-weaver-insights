-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER, -- in minutes
  attendees JSONB DEFAULT '[]'::jsonb,
  transcript TEXT,
  summary TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meetings" ON public.meetings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insights table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  sentiment_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights" ON public.insights FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat history table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chat" ON public.chat_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date DESC);
CREATE INDEX IF NOT EXISTS idx_insights_meeting_id ON public.insights(meeting_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON public.insights(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at DESC);
