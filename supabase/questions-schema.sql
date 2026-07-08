-- =============================================================
-- CSCS Test App — `questions` table.
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- The columns match the Question type in lib/questions/types.ts 1:1, so a row
-- loaded from here can be passed through rowToQuestion() straight into the app.
--
-- You can EITHER keep the question bank in code (lib/question-bank/*) OR store
-- it in this table — the schema is here so the database option is ready when
-- you want questions editable without a redeploy.
-- =============================================================

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
  created_at    timestamptz not null default now()
);

create index if not exists questions_module_idx on public.questions (module);
create index if not exists questions_topic_idx  on public.questions (module, topic);

-- Row Level Security: questions are public read-only content. Anyone (signed
-- in or not) can read them; only the service role can write.
alter table public.questions enable row level security;

drop policy if exists "questions are readable by everyone" on public.questions;
create policy "questions are readable by everyone"
  on public.questions for select
  using (true);
