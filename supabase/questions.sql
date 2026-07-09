-- =============================================================
-- CSCS Test App — question bank + recorded answers
-- Run this in the Supabase Dashboard → SQL Editor. Safe to re-run.
--
-- Cloned from the My Life in the UK Test app's questions.sql, adapted to the
-- CSCS question format (5 HS&E modules; multiple_choice / multiple_answer /
-- hotspot kinds; optional image + hotspot zones). One structural difference:
-- this app ships its question bank IN CODE (lib/question-bank/*), so
-- `questions` starts empty and `user_answers.question_id` is plain text with
-- no foreign key — answers can be recorded without seeding the table first.
-- =============================================================

-- 1. Questions: shared content, readable by any signed-in user. The columns
--    match the Question type in lib/questions/types.ts 1:1, so a row loaded
--    from here passes through rowToQuestion() straight into the app.
create table if not exists public.questions (
  id            text primary key,
  module        text not null check (module in (
                  'working_environment',
                  'occupational_health',
                  'safety',
                  'high_risk_activities',
                  'specialist_topics'
                )),
  topic         text not null,
  question_text text not null,
  options       jsonb not null default '[]'::jsonb,   -- array of 4 strings (empty for hotspot)
  correct_answer jsonb not null default '[]'::jsonb,  -- array of option indices
  explanation   text not null default '',
  image_url     text,                                  -- optional
  question_type text not null default 'multiple_choice' check (question_type in (
                  'multiple_choice',
                  'multiple_answer',
                  'hotspot'
                )),
  hotspot_zones jsonb,                                 -- optional, hotspot questions only
  created_at    timestamptz not null default now(),
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array'),
  constraint questions_correct_is_array check (jsonb_typeof(correct_answer) = 'array')
);

create index if not exists questions_module_idx on public.questions (module);
create index if not exists questions_topic_idx  on public.questions (module, topic);

alter table public.questions enable row level security;

drop policy if exists "questions are readable by everyone" on public.questions;
drop policy if exists "Questions readable by authenticated users" on public.questions;
create policy "Questions readable by authenticated users"
  on public.questions
  for select
  to authenticated
  using (true);
-- No insert/update/delete policy ⇒ clients cannot write. Seed via the SQL editor.

-- 2. User answers: append-only log, owner-only. Authoritative record of every
--    answered question (practice + mocks) — survives reinstalls and syncs
--    readiness/accuracy across devices.
create table if not exists public.user_answers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  question_id  text not null,
  module       text not null check (module in (
                 'working_environment',
                 'occupational_health',
                 'safety',
                 'high_risk_activities',
                 'specialist_topics'
               )),
  correct      boolean not null,
  is_mock      boolean not null default false,
  answered_at  timestamptz not null default now()
);

alter table public.user_answers enable row level security;

drop policy if exists "Answers selectable by owner" on public.user_answers;
create policy "Answers selectable by owner"
  on public.user_answers
  for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Answers insertable by owner" on public.user_answers;
create policy "Answers insertable by owner"
  on public.user_answers
  for insert
  with check ((select auth.uid()) = user_id);
-- No update/delete policy: answers are an append-only log.

create index if not exists user_answers_recent_idx
  on public.user_answers (user_id, answered_at desc);
create index if not exists user_answers_module_idx
  on public.user_answers (user_id, module);

notify pgrst, 'reload schema';
