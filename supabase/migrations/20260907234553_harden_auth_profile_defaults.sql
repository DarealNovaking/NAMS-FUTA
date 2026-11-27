create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    'student'::public.app_role
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- Username is an admin-facing identifier; keep it unique when supplied.
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

-- Profiles are never public-readable. The existing admin-only policy remains the only
-- access path, which prevents accidental exposure of admin usernames/metadata.
drop policy if exists "public read profiles" on public.profiles;
