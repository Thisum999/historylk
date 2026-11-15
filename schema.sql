-- ============================================================
-- HISTORY – Harshana Nallaperuma
-- Supabase (PostgreSQL) schema.
-- Paste this whole file into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

create table if not exists public.papers (
  id          text primary key,
  title       text not null,
  grade       integer not null,
  year        integer not null,
  term        text not null default 'other',
  type        text not null default 'paper',
  school      text not null default '',
  medium      text not null default 'Sinhala',
  drive_url   text not null default '',
  file_key    text,
  is_sample   boolean not null default false,
  created_at  bigint not null
);

create index if not exists idx_papers_grade on public.papers (grade);
create index if not exists idx_papers_year  on public.papers (year);

create table if not exists public.admins (
  id            text primary key,
  name          text not null,
  username      text not null,
  -- case-insensitive lookup ("History" == "history")
  username_lower text generated always as (lower(username)) stored,
  password_hash text not null,
  salt          text not null,
  status        text not null default 'pending',
  created_at    bigint not null,
  approved_at   bigint,
  approved_by   text
);

create unique index if not exists idx_admins_username_lower on public.admins (username_lower);
create index if not exists idx_admins_status on public.admins (status);

-- Lock the tables down: only the Edge Function (service_role key) may read/write.
-- The anon/publishable key gets nothing, so nobody can bypass the API.
alter table public.papers enable row level security;
alter table public.admins enable row level security;

-- ------------------------------------------------------------
-- Sample papers (delete these lines if you do not want them)
-- ------------------------------------------------------------
insert into public.papers (id, title, grade, year, term, type, school, medium, drive_url, file_key, is_sample, created_at)
values
  ('sample-11-first-2025', '11 ශ්‍රේණිය – පළමු වාර පරීක්ෂණය (ඉතිහාසය)', 11, 2025, 'first',  'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1735689600000),
  ('sample-11-third-2024', '11 ශ්‍රේණිය – තෙවන වාර පරීක්ෂණය (ඉතිහාසය)', 11, 2024, 'third',  'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1727740800000),
  ('sample-11-ol-2023',    'සාමාන්‍යපෙල 2023 – ඉතිහාසය ප්‍රශ්න පත්‍රය',      11, 2023, 'annual', 'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1696118400000),
  ('sample-10-second-2025','10 ශ්‍රේණිය – දෙවන වාර පරීක්ෂණය (ඉතිහාසය)', 10, 2025, 'second', 'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1740787200000),
  ('sample-10-annual-2024','10 ශ්‍රේණිය – වාර්ෂික පරීක්ෂණය (ඉතිහාසය)',   10, 2024, 'annual', 'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1730419200000),
  ('sample-9-first-2025',  '9 ශ්‍රේණිය – පළමු වාර පරීක්ෂණය (ඉතිහාසය)',   9, 2025, 'first',  'paper', '', 'Sinhala', '/sample-paper.pdf', null, true, 1738368000000)
on conflict (id) do nothing;
