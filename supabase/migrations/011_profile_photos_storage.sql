-- Profile photo Storage bucket and policies for the single primary profile image phase.
-- The app uploads objects to bucket `profile-photos` with object names like:
--   {user_id}/main-{timestamp}.jpg

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profile_photos
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_profile_photos_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profile_photos_updated_at on public.profile_photos;
create trigger set_profile_photos_updated_at
  before update on public.profile_photos
  for each row execute function public.set_profile_photos_updated_at();

-- Keep public profile photo rows readable to authenticated users while preserving owner/admin management.
drop policy if exists "profile_photos_select_visible_owner_or_admin" on public.profile_photos;
create policy "profile_photos_select_visible_owner_or_admin"
  on public.profile_photos for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = profile_photos.user_id
        and p.visibility = 'public'
        and p.onboarding_completed = true
    )
  );

-- Storage object policies. The first folder segment must be the authenticated user's uid.
drop policy if exists "profile_photos_objects_select_authenticated" on storage.objects;
create policy "profile_photos_objects_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'profile-photos');

drop policy if exists "profile_photos_objects_insert_owner" on storage.objects;
create policy "profile_photos_objects_insert_owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_photos_objects_update_owner" on storage.objects;
create policy "profile_photos_objects_update_owner"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_photos_objects_delete_owner" on storage.objects;
create policy "profile_photos_objects_delete_owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
