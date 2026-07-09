-- =============================================================
-- CSCS Test App — profiles table + row-level security
-- Run this in the Supabase Dashboard → SQL Editor (FIRST, before
-- onboarding.sql). Cloned from the My Life in the UK Test app.
-- =============================================================

-- 1. Table: one row per auth user, keyed to auth.users.id
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  -- onboarding / study fields (filled in by the onboarding flow)
  test_date   date,
  goal        text,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. Enable row-level security
alter table public.profiles enable row level security;

-- 3. Policies — a user may only see and change their OWN row
drop policy if exists "Profiles are viewable by the owner" on public.profiles;
create policy "Profiles are viewable by the owner"
  on public.profiles
  for select
  using ( (select auth.uid()) = id );

drop policy if exists "Profiles can be inserted by the owner" on public.profiles;
create policy "Profiles can be inserted by the owner"
  on public.profiles
  for insert
  with check ( (select auth.uid()) = id );

drop policy if exists "Profiles can be updated by the owner" on public.profiles;
create policy "Profiles can be updated by the owner"
  on public.profiles
  for update
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- 4. Keep updated_at fresh on every change
create or replace function public.handle_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_profiles_updated_at();

-- 5. Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 6. Reload the PostgREST schema cache
notify pgrst, 'reload schema';
