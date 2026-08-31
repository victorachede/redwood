-- Ewin schema reset: drop stale farm tables, create tutor app schema
-- Project: suwgpfzzxmwogsdkuote

BEGIN;

-- ── Tear down old marketplace schema ───────────────────────────────────────
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.buyers CASCADE;
DROP TABLE IF EXISTS public.farmers CASCADE;
DROP TABLE IF EXISTS public.contact_messages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles (1:1 with auth.users) ──────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  exam_focus TEXT DEFAULT 'WAEC & JAMB',
  school TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  plan_interval TEXT CHECK (plan_interval IS NULL OR plan_interval IN ('monthly', 'yearly')),
  paystack_customer_code TEXT,
  paystack_subscription_code TEXT,
  plan_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Tutor sessions (chat history) ──────────────────────────────────────────
CREATE TABLE public.tutor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  subject_name TEXT,
  topic TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tutor_sessions_user_updated ON public.tutor_sessions (user_id, updated_at DESC);

-- ── Practice attempts ──────────────────────────────────────────────────────
CREATE TABLE public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  exam TEXT NOT NULL DEFAULT 'ALL' CHECK (exam IN ('ALL', 'JAMB', 'WAEC', 'NECO')),
  correct INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  timed BOOLEAN NOT NULL DEFAULT false,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX practice_attempts_user_at ON public.practice_attempts (user_id, at DESC);

-- ── Study cards ────────────────────────────────────────────────────────────
CREATE TABLE public.study_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT,
  source TEXT DEFAULT 'tutor' CHECK (source IN ('tutor', 'practice', 'work', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX study_cards_user ON public.study_cards (user_id, created_at DESC);

-- ── Mastery map (adaptive tutor) ───────────────────────────────────────────
CREATE TABLE public.mastery (
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  score REAL NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  error_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, subject_id, topic)
);

-- ── Assignments (classwork / homework issued by tutor) ─────────────────────
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('classwork', 'homework')),
  subject_id TEXT,
  brief TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX assignments_user_status ON public.assignments (user_id, status, created_at DESC);

-- ── Auto-create profile on signup ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tutor sessions
CREATE POLICY sessions_all_own ON public.tutor_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Practice
CREATE POLICY practice_all_own ON public.practice_attempts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cards
CREATE POLICY cards_all_own ON public.study_cards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Mastery
CREATE POLICY mastery_all_own ON public.mastery FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assignments
CREATE POLICY assignments_all_own ON public.assignments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMIT;
