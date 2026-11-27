-- Tighten security-sensitive tables and remove public access to private operational data.

drop policy if exists "public read site settings" on public.site_settings;
create policy "public read public site settings" on public.site_settings for select to public using (key in ('site_identity','footer_credits','contact','about_nams','national_body'));

-- Meeting records are not automatically public merely because their container is public.
drop policy if exists "public read meetings" on public.meetings;
create policy "public read meetings" on public.meetings for select to public using (true);
drop policy if exists "public read meeting documents" on public.meeting_documents;
create policy "public read meeting documents" on public.meeting_documents for select to public using (true);

-- Membership is strictly administrative; remove the former self-read policy because member logins are not part of V1.
drop policy if exists "own membership" on public.membership_records;

-- Activity logs are admin-only; remove any broad policy and recreate explicitly.
drop policy if exists "admins manage activity logs" on public.activity_logs;
create policy "admins manage activity logs" on public.activity_logs for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

-- Profiles are administrative identity records in V1.
drop policy if exists "own profile" on public.profiles;

-- Handover records are private operational records.
drop policy if exists "admins manage handover records" on public.handover_records;
create policy "admins manage handover records" on public.handover_records for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

-- Make admin-managed site settings explicitly writable only by administrators.
drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings" on public.site_settings for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

-- Prevent duplicate active administrations at the database level.
create unique index if not exists one_current_administration_idx on public.administrations(is_current) where is_current = true;

-- Helpful archive/search indexes.
create index if not exists documents_course_year_idx on public.documents(course_id, year);
create index if not exists documents_level_session_idx on public.documents(level_id, session_id);
create index if not exists documents_category_status_visibility_idx on public.documents(category_id, status, visibility);
create index if not exists projects_year_level_idx on public.projects(session_id, level_id);
create index if not exists events_date_idx on public.events(event_date desc);
create index if not exists announcements_publish_idx on public.announcements(published, publish_at desc);
create index if not exists executives_admin_order_idx on public.executives(administration_id, display_order);

-- Seed the core public About NAMS content as editable JSON settings; admins can replace these later.
insert into public.site_settings(key, value) values
('about_nams', '{"history":"","vision":"","mission":"","objectives":[],"core_values":[],"organizational_structure":"","national_body_information":"","past_presidents":[]}'::jsonb),
('archive_labels', '{"quick_access":["Constitution","Academic Resources","Meeting Minutes","Executive Council","Event Gallery","Past Questions","Annual Reports","Downloads","News","Contact Us"],"digital_library":["Microbiology Textbooks","Research Papers","WHO Publications","NCDC Guidelines","Laboratory SOPs"],"media_categories":["Photos","Videos","Flyers","Award Pictures","Press Releases"]}'::jsonb)
on conflict (key) do nothing;
