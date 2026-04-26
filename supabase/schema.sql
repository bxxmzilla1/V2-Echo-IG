-- Run this in the Supabase SQL editor (SQL → New query).
-- Then create a public Storage bucket named "profile-media" (or match BUCKET in services/supabasePublish.ts).

create table if not exists public.published_profiles (
  slug text primary key check (char_length(slug) between 2 and 64),
  profile_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists published_profiles_updated_idx on public.published_profiles (updated_at desc);

alter table public.published_profiles enable row level security;

-- Public can read all published profiles (adjust for private apps)
create policy "published_read_all"
  on public.published_profiles for select
  using (true);

-- Allow anon writes (tighten with Supabase Auth or a server secret for production)
create policy "published_insert"
  on public.published_profiles for insert
  with check (true);

create policy "published_update"
  on public.published_profiles for update
  using (true)
  with check (true);

-- Optional: allow deletes
-- create policy "published_delete" on public.published_profiles for delete using (true);

-- Storage bucket (run in SQL or use Dashboard → Storage)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','application/octet-stream'])
on conflict (id) do nothing;

-- Let anonymous clients upload to profile-media (tighten for production, e.g. auth + policies)
create policy "profile media public read" on storage.objects
  for select using (bucket_id = 'profile-media');

create policy "profile media anon insert" on storage.objects
  for insert with check (bucket_id = 'profile-media');

create policy "profile media anon update" on storage.objects
  for update using (bucket_id = 'profile-media')
  with check (bucket_id = 'profile-media');

comment on table public.published_profiles is 'Echo IG published profile JSON; media URLs point to profile-media bucket.';
