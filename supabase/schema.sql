-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists public.biodatas (
  id text primary key,
  gender text not null check (gender in ('m','f')),
  name text not null default '',
  answers jsonb not null,
  ops jsonb not null,
  theme int not null default 0,
  poster_path text not null,
  card_path text not null,
  created_at timestamptz not null default now()
);

-- The server uses the service role key, which bypasses RLS.
-- With RLS on and no policies, nobody can read/write the table from the browser.
alter table public.biodatas enable row level security;

-- Public bucket for the poster and the 1200x630 Facebook card
insert into storage.buckets (id, name, public)
values ('biodata-images', 'biodata-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read biodata images" on storage.objects;
create policy "public read biodata images"
  on storage.objects for select
  using (bucket_id = 'biodata-images');
