-- =============================================
-- MEMBERS TABLE — paste this into Supabase SQL Editor
-- =============================================

create table if not exists public.members (
  id                   uuid primary key default gen_random_uuid(),
  first_name           text not null,
  last_name            text not null,
  phone                text,
  email                text,
  role                 text default '',
  debt_status          text default 'clear' check (debt_status in ('clear','owing','critical')),
  outstanding_debt     numeric default 0,
  penalties            numeric default 0,
  total_levies         numeric default 0,
  total_contributions  numeric default 0,
  created_at           timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.members enable row level security;

-- Allow anon full access — adjust if you use auth
create policy "Allow all access to members"
  on public.members
  for all
  using (true)
  with check (true);

-- Indexes
create index if not exists idx_members_name on public.members (last_name, first_name);
create index if not exists idx_members_debt on public.members (debt_status);
