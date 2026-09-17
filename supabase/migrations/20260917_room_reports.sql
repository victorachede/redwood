-- Study room message reports
-- Project: suwgpfzzxmwogsdkuote

BEGIN;

-- ── Room reports ─────────────────────────────────────────────────────────
-- Ordinary room chat is never written here or anywhere else — presence and
-- chat both live only in Supabase Realtime's in-memory state (see
-- app/lib/rooms.ts). This table exists solely so a report is durable
-- enough to actually act on: a reported message, who sent it, who reported
-- it, and when. It is not a chat log — nobody can read it back through the
-- anon key, not even the person who filed the report.
CREATE TABLE public.room_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reported_name TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX room_reports_created ON public.room_reports (created_at DESC);

ALTER TABLE public.room_reports ENABLE ROW LEVEL SECURITY;

-- Insert-only, and only as yourself reporting someone else. No SELECT
-- policy exists at all, so RLS denies every read through the anon key —
-- review happens with the service role only.
CREATE POLICY room_reports_insert_own ON public.room_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND auth.uid() <> reported_id);

COMMIT;
