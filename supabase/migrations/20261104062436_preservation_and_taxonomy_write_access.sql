do $$
declare t text;
begin
  foreach t in array array['administrations','executives','sessions','meetings','courses',
                           'alumni','media','projects','events','announcements','website_files']
  loop
    execute format('alter table public.%I add column if not exists archived_at timestamptz', t);
    execute format('alter table public.%I add column if not exists archived_by uuid references public.profiles(id) on delete set null', t);
    execute format('create index if not exists %I on public.%I (archived_by)', t||'_archived_by_idx', t);
  end loop;
end $$;

drop policy "read public administrations" on public.administrations;
create policy "read public administrations" on public.administrations for select using (archived_at is null);

drop policy "read executives" on public.executives;
create policy "read executives" on public.executives for select using (archived_at is null);

drop policy "public read sessions" on public.sessions;
create policy "public read sessions" on public.sessions for select using (archived_at is null);

drop policy "public read meetings" on public.meetings;
create policy "public read meetings" on public.meetings for select using (archived_at is null);

drop policy "public read courses" on public.courses;
create policy "public read courses" on public.courses for select using (archived_at is null);

drop policy "read published events" on public.events;
create policy "read published events" on public.events for select using (
  archived_at is null
  and status is distinct from 'draft' and status is distinct from 'unpublished');

drop policy "read public alumni" on public.alumni;
create policy "read public alumni" on public.alumni for select using (
  archived_at is null and (
    visibility = 'public'::visibility_level
    or (visibility = 'student'::visibility_level and (select auth.uid()) is not null)
    or extensions."current_role"() = any (array['admin'::app_role,'super_admin'::app_role])));

drop policy "read currently published announcements" on public.announcements;
create policy "read currently published announcements" on public.announcements for select using (
  archived_at is null and (
    (published = true and (publish_at is null or publish_at <= now()) and (expires_at is null or expires_at > now()))
    or extensions."current_role"() = any (array['admin'::app_role,'super_admin'::app_role])));

drop policy "read public media" on public.media;
create policy "read public media" on public.media for select using (
  archived_at is null and (
    visibility = 'public'::visibility_level
    or extensions."current_role"() = any (array['admin'::app_role,'super_admin'::app_role])));

drop policy "read public projects" on public.projects;
create policy "read public projects" on public.projects for select using (
  archived_at is null and (
    visibility = 'public'::visibility_level
    or (visibility = 'student'::visibility_level and (select auth.uid()) is not null)
    or extensions."current_role"() = any (array['admin'::app_role,'super_admin'::app_role])));

create or replace function public.prevent_hard_delete()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('postgres','supabase_admin','service_role')
     or coalesce(auth.role(), '') = 'service_role' then
    return old;
  end if;
  if extensions."current_role"() = 'super_admin'::public.app_role then
    return old;
  end if;
  raise exception 'Hard delete is disabled for % records. Archive the record instead.', tg_table_name
    using errcode = '42501';
end;
$$;
revoke all on function public.prevent_hard_delete() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['administrations','executives','sessions','meetings','courses','levels','semesters',
                           'archive_categories','handover_records','documents','projects','events','media',
                           'alumni','announcements','website_files','membership_records']
  loop
    execute format('drop trigger if exists prevent_hard_delete on public.%I', t);
    execute format('create trigger prevent_hard_delete before delete on public.%I
                    for each row execute function public.prevent_hard_delete()', t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['levels','semesters','sessions','courses','archive_categories']
  loop
    execute format('drop policy if exists %I on public.%I', 'admins insert '||t, t);
    execute format('drop policy if exists %I on public.%I', 'admins update '||t, t);
    execute format($p$create policy %I on public.%I for insert to authenticated
      with check ((select extensions."current_role"()) = any (array['admin'::public.app_role,'super_admin'::public.app_role]))$p$, 'admins insert '||t, t);
    execute format($p$create policy %I on public.%I for update to authenticated
      using ((select extensions."current_role"()) = any (array['admin'::public.app_role,'super_admin'::public.app_role]))
      with check ((select extensions."current_role"()) = any (array['admin'::public.app_role,'super_admin'::public.app_role]))$p$, 'admins update '||t, t);
  end loop;
end $$;

drop policy if exists "admins read all sessions" on public.sessions;
create policy "admins read all sessions" on public.sessions for select to authenticated
  using ((select extensions."current_role"()) = any (array['admin'::public.app_role,'super_admin'::public.app_role]));
drop policy if exists "admins read all courses" on public.courses;
create policy "admins read all courses" on public.courses for select to authenticated
  using ((select extensions."current_role"()) = any (array['admin'::public.app_role,'super_admin'::public.app_role]));
