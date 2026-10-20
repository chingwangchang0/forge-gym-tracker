-- Run in your Supabase project's SQL Editor.
create table if not exists public.gym_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.gym_data enable row level security;
revoke all on public.gym_data from anon;
grant select, insert, update, delete on public.gym_data to authenticated;
create policy "Read own gym data" on public.gym_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own gym data" on public.gym_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own gym data" on public.gym_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own gym data" on public.gym_data for delete to authenticated using ((select auth.uid()) = user_id);
