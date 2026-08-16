-- Run this in Supabase → SQL Editor once. It creates the table used by the
-- multiplayer race leaderboard and opens it for public reads + writes so
-- guests (not signed in) can also record results.

create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  room text,
  wpm integer not null,
  accuracy integer not null,
  won boolean default false,
  created_at timestamptz default now()
);

alter table public.races enable row level security;

create policy "races_public_insert" on public.races
  for insert with check (true);

create policy "races_public_select" on public.races
  for select using (true);

-- ---------------------------------------------------------------------------
-- Username sign-in. Accounts store an internal email "<username>@yestyping.local"
-- (email confirmation must be OFF). This security-definer RPC resolves a
-- username back to that internal email so sign-in works with a username.
-- ---------------------------------------------------------------------------

create or replace function public.get_auth_email(username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from auth.users where email = username || '@yestyping.local'
$$;

revoke all on function public.get_auth_email(text) from public;
grant execute on function public.get_auth_email(text) to anon, authenticated;
