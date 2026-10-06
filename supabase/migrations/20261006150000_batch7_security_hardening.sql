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


-- RLS policies need a callable helper, but it must not be exposed as a public RPC.
-- Keep the original SECURITY DEFINER helper non-executable by API roles and expose
-- only an unlisted-schema wrapper to the RLS policy engine.
create or replace function extensions.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role();
$$;

revoke all on function extensions.current_role() from public;
grant execute on function extensions.current_role() to anon, authenticated;

do $$
declare
  p record;
  u text;
  w text;
  sql text;
begin
  for p in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (qual like '%current_role%' or with_check like '%current_role%')
  loop
    u := case
      when p.qual is null then null
      else replace(p.qual, '"current_role"()', 'extensions.current_role()')
    end;
    w := case
      when p.with_check is null then null
      else replace(p.with_check, '"current_role"()', 'extensions.current_role()')
    end;

    sql := format('alter policy %I on public.%I', p.policyname, p.tablename);
    if u is not null then sql := sql || format(' using (%s)', u); end if;
    if w is not null then sql := sql || format(' with check (%s)', w); end if;
    execute sql;
  end loop;
end
$$;
