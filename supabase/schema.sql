-- Nearby Gems database schema.
-- Paste into Supabase → SQL Editor → Run. Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- Preferences: one row per user with their questionnaire answers
-- ─────────────────────────────────────────────────────────────
create table if not exists public.preferences (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  categories text[] not null
             check (cardinality(categories) > 0
                    and categories <@ array['history', 'art', 'nature']::text[]),
  vibe       text not null check (vibe in ('quiet', 'lively', 'any')),
  updated_at timestamptz not null default now()
);

-- Row Level Security: users can only see and change their own row.
-- This is what makes it safe to ship the anon key in the browser.
alter table public.preferences enable row level security;

drop policy if exists "preferences: read own" on public.preferences;
create policy "preferences: read own" on public.preferences
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "preferences: insert own" on public.preferences;
create policy "preferences: insert own" on public.preferences
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "preferences: update own" on public.preferences;
create policy "preferences: update own" on public.preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Expose the table to signed-in users via the Data API (newer projects don't do this automatically).
grant select, insert, update on public.preferences to authenticated;
