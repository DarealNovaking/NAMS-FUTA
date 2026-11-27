alter table public.activity_logs enable row level security;

drop policy if exists "admins manage activity logs" on public.activity_logs;
drop policy if exists "admins read activity logs" on public.activity_logs;
drop policy if exists "users insert own activity logs" on public.activity_logs;

create policy "admins read activity logs"
on public.activity_logs
for select
using (extensions.current_role() = any (array['admin'::app_role, 'super_admin'::app_role]));

create policy "users insert own activity logs"
on public.activity_logs
for insert
to authenticated
with check (user_id = auth.uid());

-- Deliberately create no UPDATE or DELETE policy: client-facing roles cannot rewrite or erase audit history.
