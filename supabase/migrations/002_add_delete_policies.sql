-- If you first ran the older schema without delete policies, run this once in Supabase SQL.

drop policy if exists "published_delete" on public.published_profiles;
create policy "published_delete" on public.published_profiles for delete using (true);

drop policy if exists "profile media anon delete" on storage.objects;
create policy "profile media anon delete" on storage.objects
  for delete using (bucket_id = 'profile-media');
