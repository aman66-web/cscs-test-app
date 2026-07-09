-- =============================================================
-- CSCS Test App — self-service account deletion
-- Run this in the Supabase Dashboard → SQL Editor. Safe to re-run.
-- Cloned from the My Life in the UK Test app's settings.sql. (Its
-- theme_preference column is skipped: unused there and this app is
-- light-theme only.)
-- =============================================================

-- Let a signed-in user delete their OWN account without the service-role key.
-- SECURITY DEFINER runs as the function owner so it can remove the auth.users
-- row; it only ever deletes the caller's own id (auth.uid()). The cascade on
-- profiles / user_answers / coach_usage cleans up their data automatically.
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

notify pgrst, 'reload schema';
