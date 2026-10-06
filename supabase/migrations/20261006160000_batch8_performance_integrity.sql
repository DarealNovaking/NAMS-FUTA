-- Batch 8: targeted foreign-key indexes and planner statistics.
-- Existing indexes are retained because the archive is still pre-production.

create index if not exists activity_logs_user_id_idx on public.activity_logs (user_id);
create index if not exists administrations_session_id_idx on public.administrations (session_id);
create index if not exists alumni_session_id_idx on public.alumni (session_id);
create index if not exists announcements_created_by_idx on public.announcements (created_by);
create index if not exists archive_categories_parent_id_idx on public.archive_categories (parent_id);
create index if not exists courses_level_id_idx on public.courses (level_id);
create index if not exists documents_semester_id_idx on public.documents (semester_id);
create index if not exists documents_uploaded_by_idx on public.documents (uploaded_by);
create index if not exists download_logs_user_id_idx on public.download_logs (user_id);
create index if not exists event_documents_document_id_idx on public.event_documents (document_id);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists handover_records_completed_by_idx on public.handover_records (completed_by);
create index if not exists handover_records_created_by_idx on public.handover_records (created_by);
create index if not exists handover_records_from_administration_id_idx on public.handover_records (from_administration_id);
create index if not exists handover_records_to_administration_id_idx on public.handover_records (to_administration_id);
create index if not exists media_event_id_idx on public.media (event_id);
create index if not exists media_uploaded_by_idx on public.media (uploaded_by);
create index if not exists meeting_documents_document_id_idx on public.meeting_documents (document_id);
create index if not exists meetings_created_by_idx on public.meetings (created_by);
create index if not exists membership_records_level_id_idx on public.membership_records (level_id);
create index if not exists membership_records_session_id_idx on public.membership_records (session_id);
create index if not exists membership_records_user_id_idx on public.membership_records (user_id);
create index if not exists projects_document_id_idx on public.projects (document_id);
create index if not exists projects_level_id_idx on public.projects (level_id);
create index if not exists site_settings_updated_by_idx on public.site_settings (updated_by);
create index if not exists website_files_uploaded_by_idx on public.website_files (uploaded_by);

analyze public.activity_logs;
analyze public.administrations;
analyze public.alumni;
analyze public.announcements;
analyze public.archive_categories;
analyze public.courses;
analyze public.documents;
analyze public.download_logs;
analyze public.event_documents;
analyze public.events;
analyze public.handover_records;
analyze public.media;
analyze public.meeting_documents;
analyze public.meetings;
analyze public.membership_records;
analyze public.projects;
analyze public.site_settings;
analyze public.website_files;
