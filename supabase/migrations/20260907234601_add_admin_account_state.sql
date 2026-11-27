alter table public.profiles
  add column if not exists is_active boolean not null default true;

create index if not exists profiles_role_active_idx
  on public.profiles (role, is_active);

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $function$
  select coalesce(
    (
      select role
      from public.profiles
      where id = auth.uid()
        and is_active = true
    ),
    'student'::public.app_role
  );
$function$;
