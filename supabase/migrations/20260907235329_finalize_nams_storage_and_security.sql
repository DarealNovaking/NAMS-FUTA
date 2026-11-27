-- NAMS FUTA Digital Archive: final database/storage hardening for V1

-- Admin identity safeguards.
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

-- Keep role lookup safe and make disabled admins immediately lose elevated access.
create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.profiles
      where id = auth.uid()
        and is_active = true
    ),
    'student'::public.app_role
  );
$$;

-- Never allow Auth metadata to self-assign an elevated role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, role, is_active)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    'student'::public.app_role,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Public announcements must be currently visible only; admins retain full management access.
drop policy if exists "read currently published announcements" on public.announcements;
create policy "read currently published announcements"
on public.announcements
for select to public
using (
  (
    published = true
    and (publish_at is null or publish_at <= now())
    and (expires_at is null or expires_at > now())
  )
  or public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
);

-- Helpful indexes for public archive joins and admin lists.
create index if not exists documents_public_archive_idx
  on public.documents (status, visibility, year);
create index if not exists event_documents_event_idx
  on public.event_documents (event_id, display_order);
create index if not exists meeting_documents_meeting_idx
  on public.meeting_documents (meeting_id, display_order);
create index if not exists media_visibility_year_idx
  on public.media (visibility, year);
create index if not exists announcements_public_schedule_idx
  on public.announcements (published, publish_at, expires_at);

-- Private buckets: files are delivered through signed URLs rather than public object URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('archive-documents','archive-documents',false,52428800,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain']),
  ('project-files','project-files',false,52428800,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  ('gallery','gallery',false,10485760,array['image/jpeg','image/png','image/webp']),
  ('executive-photos','executive-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
  ('event-media','event-media',false,104857600,array['image/jpeg','image/png','image/webp','video/mp4','video/webm']),
  ('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp']),
  ('website-files','website-files',false,52428800,array['application/pdf','image/jpeg','image/png','image/webp','text/plain'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage management is admin-only. No public SELECT policy is created for these private buckets.
drop policy if exists "admins can upload archive storage" on storage.objects;
drop policy if exists "admins can update archive storage" on storage.objects;
drop policy if exists "admins can delete archive storage" on storage.objects;
drop policy if exists "admins can read archive storage" on storage.objects;

create policy "admins can upload archive storage"
on storage.objects
for insert to authenticated
with check (
  public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  and bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
);

create policy "admins can update archive storage"
on storage.objects
for update to authenticated
using (
  public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  and bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
)
with check (
  public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  and bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
);

create policy "admins can delete archive storage"
on storage.objects
for delete to authenticated
using (
  public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  and bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
);

create policy "admins can read archive storage"
on storage.objects
for select to authenticated
using (
  public.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role)
  and bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
);

-- Restrict site settings to the explicitly public keys already chosen for the public website.
drop policy if exists "public read public site settings" on public.site_settings;
create policy "public read public site settings"
on public.site_settings
for select to public
using (key in ('site_identity','footer_credits','contact','about_nams','national_body'));
