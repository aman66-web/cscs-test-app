-- =============================================================
-- CSCS Test App — AI coach daily usage cap (cost control)
-- Run this in the Supabase Dashboard → SQL Editor. Safe to re-run.
-- Cloned unchanged from the My Life in the UK Test app.
--
-- The coach API calls increment_coach_usage(limit) before each Anthropic
-- request. The counter is atomic (no read-modify-write race) and keyed by
-- (user, UTC day). Returns the new count, or -1 when the user has already
-- used today's allowance. The app passes the limit so it stays a single
-- config value in code (COACH_DAILY_LIMIT).
-- =============================================================

create table if not exists public.coach_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  count   int  not null default 0,
  primary key (user_id, day)
);

alter table public.coach_usage enable row level security;
-- No direct client policies: all access goes through the RPC below
-- (SECURITY DEFINER), which only ever touches the caller's own row.

create or replace function public.increment_coach_usage(daily_limit int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count int;
begin
  insert into coach_usage (user_id, day, count)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update
    set count = coach_usage.count + 1
    where coach_usage.count < daily_limit
  returning count into new_count;

  -- Conflict row already at the limit → the UPDATE's WHERE filtered it out,
  -- nothing was returned: signal "limit reached".
  return coalesce(new_count, -1);
end;
$$;

revoke all on function public.increment_coach_usage(int) from public, anon;
grant execute on function public.increment_coach_usage(int) to authenticated;

-- Housekeeping (optional): old rows are tiny; clear them occasionally with
--   delete from public.coach_usage where day < current_date - 30;

notify pgrst, 'reload schema';
