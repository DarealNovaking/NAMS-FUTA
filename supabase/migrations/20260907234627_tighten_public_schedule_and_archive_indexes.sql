drop policy if exists "read published announcements" on public.announcements;
create policy "read currently published announcements" on public.announcements
  for select to public
  using (
    (
      published = true
      and (publish_at is null or publish_at <= now())
      and (expires_at is null or expires_at > now())
    )
    or public.current_role() = any (array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

-- Public website files are intentionally not exposed through the table; the application
-- can later expose selected files through controlled signed URLs.

drop policy if exists "public read website files" on public.website_files;

create index if not exists announcements_public_schedule_idx
  on public.announcements (published, publish_at, expires_at);
create index if not exists projects_public_lookup_idx
  on public.projects (visibility, session_id, level_id, research_area);
create index if not exists documents_public_lookup_idx
  on public.documents (status, visibility, year, session_id, course_id, category_id);
create index if not exists meetings_archive_lookup_idx
  on public.meetings (administration_id, year, meeting_type, meeting_date);
create index if not exists events_archive_lookup_idx
  on public.events (event_category, event_date, status);
create index if not exists media_archive_lookup_idx
  on public.media (visibility, year, category, event_id);
