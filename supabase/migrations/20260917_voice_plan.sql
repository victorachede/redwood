-- Widen profiles.plan to allow 'voice', the new paid tier for live
-- voice tutoring (see PLANS.voice in app/lib/billing.ts).
alter table public.profiles
  drop constraint profiles_plan_check;
alter table public.profiles
  add constraint profiles_plan_check check (plan = any (array['free'::text, 'pro'::text, 'voice'::text]));
