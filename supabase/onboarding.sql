-- =============================================================
-- CSCS Test App — onboarding columns for the profiles table
-- Run this in the Supabase Dashboard → SQL Editor AFTER profiles.sql.
-- Safe to re-run (idempotent). Cloned from the My Life in the UK Test
-- app; the previous-score range is 0–50 (the CITB HS&E mock is 50
-- questions, not 24).
-- =============================================================

-- 1. Add the onboarding / study columns
alter table public.profiles
  add column if not exists date_of_birth        date,
  add column if not exists first_name           text,
  add column if not exists last_name            text,
  add column if not exists taken_before         boolean,
  add column if not exists previous_score       int,
  add column if not exists hardest_topics       jsonb,
  add column if not exists hardest_notes        text,
  add column if not exists onboarding_completed boolean not null default false;

-- 2. Guard the previous test score to a valid range (0–50), nullable when skipped
alter table public.profiles
  drop constraint if exists profiles_previous_score_range;
alter table public.profiles
  add constraint profiles_previous_score_range
  check (previous_score is null or (previous_score between 0 and 50));

-- Row-level security and the owner-only select/insert/update policies from
-- profiles.sql already cover these new columns — no policy changes needed.

-- 3. Reload the PostgREST schema cache
notify pgrst, 'reload schema';
