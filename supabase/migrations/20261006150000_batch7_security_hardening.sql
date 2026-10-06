-- Batch 7 security hardening: remove public execution from internal helpers,
-- keep pg_trgm out of the exposed public schema, and avoid per-row auth re-evaluation.

revoke execute on function public."current_role"() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

alter extension pg_trgm set schema extensions;

alter policy "read public alumni" on public.alumni
using (
  (visibility = 'public'::visibility_level)
  or ((visibility = 'student'::visibility_level) and (select auth.uid()) is not null)
  or ("current_role"() = any (array['admin'::app_role, 'super_admin'::app_role]))
);

alter policy "read public projects" on public.projects
using (
  (visibility = 'public'::visibility_level)
  or ((visibility = 'student'::visibility_level) and (select auth.uid()) is not null)
  or ("current_role"() = any (array['admin'::app_role, 'super_admin'::app_role]))
);

alter policy "users log downloads" on public.download_logs
with check (
  ((select auth.uid()) = user_id) or (user_id is null)
);

alter policy "read documents by visibility" on public.documents
using (
  (status = 'published'::document_status)
  and (
    (visibility = 'public'::visibility_level)
    or ((visibility = 'student'::visibility_level) and (select auth.uid()) is not null)
    or ("current_role"() = any (array['admin'::app_role, 'super_admin'::app_role]))
  )
);
