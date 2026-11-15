-- The shared practice question bank.
--
-- Read by every student (app/lib/generatedQuestions.ts fetchBank, as anon)
-- and written only by the server with the service role (app/api/questions).
-- The checks mirror validateQuestion() in app/lib/questionGen.ts, so a row
-- the app would reject can never be stored in the first place.

CREATE TABLE IF NOT EXISTS public.generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  exam TEXT NOT NULL CHECK (exam IN ('JAMB', 'WAEC', 'NECO')),
  question TEXT NOT NULL CHECK (length(btrim(question)) >= 12),
  options JSONB NOT NULL CHECK (options ?& ARRAY['A', 'B', 'C', 'D']),
  answer TEXT NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL CHECK (length(btrim(explanation)) >= 20),
  difficulty SMALLINT NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
  verified BOOLEAN NOT NULL DEFAULT false,
  -- Same stem twice in one subject is a duplicate, whatever its casing.
  question_key TEXT GENERATED ALWAYS AS (md5(lower(btrim(question)))) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS generated_questions_subject_key
  ON public.generated_questions (subject_id, question_key);
CREATE INDEX IF NOT EXISTS generated_questions_lookup
  ON public.generated_questions (subject_id, topic, exam) WHERE verified;

ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verified questions are readable by everyone" ON public.generated_questions;
CREATE POLICY "Verified questions are readable by everyone"
  ON public.generated_questions FOR SELECT
  TO anon, authenticated
  USING (verified);
