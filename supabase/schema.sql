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
