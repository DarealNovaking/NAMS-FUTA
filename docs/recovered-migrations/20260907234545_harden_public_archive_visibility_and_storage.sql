-- Tighten public archive visibility and prepare secure storage boundaries.

-- Media needs an explicit visibility boundary instead of exposing every uploaded item.
alter table public.media
  add column if not exists visibility public.visibility_level not null default 'public';

-- Public events must not expose draft/unpublished records.
drop policy if exists "read events" on public.events;
create policy "read published events" on public.events
  for select to public
  using (status is distinct from 'draft' and status is distinct from 'unpublished');

-- Only expose event-document links when both the event and linked document are public/published.
drop policy if exists "public read event documents" on public.event_documents;
create policy "public read published event documents" on public.event_documents
  for select to public
  using (
    exists (
      select 1 from public.events e
      where e.id = event_documents.event_id
        and e.status is distinct from 'draft'
        and e.status is distinct from 'unpublished'
    )
    and exists (
      select 1 from public.documents d
      where d.id = event_documents.document_id
        and d.status = 'published'::public.document_status
        and d.visibility = 'public'::public.visibility_level
    )
  );

-- Meeting-document links should never expose private/student/admin documents.
drop policy if exists "public read meeting documents" on public.meeting_documents;
create policy "public read published meeting documents" on public.meeting_documents
  for select to public
  using (
    exists (
      select 1 from public.documents d
      where d.id = meeting_documents.document_id
        and d.status = 'published'::public.document_status
        and d.visibility = 'public'::public.visibility_level
    )
  );

-- Public media is explicitly marked public; admin users retain full management access.
drop policy if exists "read media" on public.media;
create policy "read public media" on public.media
  for select to public
  using (
    visibility = 'public'::public.visibility_level
    or public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

-- Membership records are sensitive and must remain admin-only.
drop policy if exists "admin manage membership" on public.membership_records;
create policy "admin manage membership" on public.membership_records
  for all to public
  using (public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role]))
  with check (public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role]));

-- Storage buckets. All buckets start private; public delivery can later be done through
-- controlled signed URLs / a public bucket only where appropriate.
insert into storage.buckets (id, name, public)
values
  ('archive-documents', 'archive-documents', false),
  ('project-files', 'project-files', false),
  ('gallery', 'gallery', false),
  ('executive-photos', 'executive-photos', false),
  ('event-media', 'event-media', false),
  ('avatars', 'avatars', false),
  ('website-files', 'website-files', false)
on conflict (id) do update set public = excluded.public;

-- Admin-only object management. Reads remain private until the application requests
-- a signed URL through a trusted server-side path.
drop policy if exists "admins manage archive storage" on storage.objects;
create policy "admins manage archive storage" on storage.objects
  for all to authenticated
  using (
    bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
    and public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role])
  )
  with check (
    bucket_id in ('archive-documents','project-files','gallery','executive-photos','event-media','avatars','website-files')
    and public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

create index if not exists media_visibility_idx on public.media (visibility);
create index if not exists events_status_idx on public.events (status);
