create extension if not exists pgcrypto;

create type public.app_role as enum ('student','admin','super_admin');
create type public.visibility_level as enum ('public','student','admin');
create type public.document_status as enum ('draft','published','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  role public.app_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.archive_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.archive_categories(id) on delete cascade,
  description text,
  display_order integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order integer not null unique
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_year integer,
  end_year integer
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  level_id uuid references public.levels(id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.archive_categories(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  semester_id uuid references public.semesters(id) on delete set null,
  year integer,
  file_name text,
  file_path text,
  file_type text,
  file_size bigint,
  thumbnail_path text,
  tags text[] not null default '{}',
  visibility public.visibility_level not null default 'student',
  status public.document_status not null default 'draft',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  abstract text,
  authors text[] not null default '{}',
  supervisor text,
  department text default 'Microbiology',
  level_id uuid references public.levels(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  keywords text[] not null default '{}',
  document_id uuid references public.documents(id) on delete set null,
  visibility public.visibility_level not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.administrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  session_id uuid references public.sessions(id) on delete set null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.executives (
  id uuid primary key default gen_random_uuid(),
  administration_id uuid not null references public.administrations(id) on delete cascade,
  name text not null,
  position text not null,
  photo_path text,
  biography text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  cover_image_path text,
  priority integer not null default 0,
  published boolean not null default false,
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  start_time time,
  end_time time,
  venue text,
  cover_image_path text,
  status text not null default 'upcoming',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  file_path text not null,
  category text,
  year integer,
  event_id uuid references public.events(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.alumni (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  graduation_year integer,
  session_id uuid references public.sessions(id) on delete set null,
  profession text,
  organization text,
  bio text,
  photo_path text,
  visibility public.visibility_level not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  membership_number text unique,
  session_id uuid references public.sessions(id) on delete set null,
  level_id uuid references public.levels(id) on delete set null,
  status text not null default 'active',
  joined_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.download_logs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.website_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  file_path text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index documents_category_idx on public.documents(category_id);
create index documents_level_idx on public.documents(level_id);
create index documents_course_idx on public.documents(course_id);
create index documents_session_idx on public.documents(session_id);
create index documents_visibility_status_idx on public.documents(visibility,status);
create index documents_tags_idx on public.documents using gin(tags);
create index projects_keywords_idx on public.projects using gin(keywords);
create index activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index download_logs_document_idx on public.download_logs(document_id);

insert into public.levels(name,display_order) values ('100 Level',100),('200 Level',200),('300 Level',300),('400 Level',400),('500 Level',500);
insert into public.semesters(name) values ('First Semester'),('Second Semester');

insert into public.archive_categories(name,slug,display_order) values
('Administration','administration',1),
('Academic Resources','academic-resources',2),
('Past Questions','past-questions',3),
('Project Library','project-library',4),
('Events','events',5),
('Media Gallery','media-gallery',6),
('Alumni','alumni',7),
('Membership Records','membership-records',8),
('Downloads','downloads',9),
('Website Files','website-files',10);

insert into public.archive_categories(name,slug,parent_id,display_order)
select v.name, v.slug, c.id, v.ord
from (values
('Constitution','constitution',1),('Policies','policies',2),('Executive Council','executive-council',3),('Minutes','minutes',4),('Reports','reports',5),('Financial Records','financial-records',6),('Handover Notes','handover-notes',7)
) v(name,slug,ord)
join public.archive_categories c on c.slug='administration';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,username,full_name) values (new.id,new.raw_user_meta_data->>'username',new.raw_user_meta_data->>'full_name');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.archive_categories enable row level security;
alter table public.levels enable row level security;
alter table public.sessions enable row level security;
alter table public.semesters enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.projects enable row level security;
alter table public.administrations enable row level security;
alter table public.executives enable row level security;
alter table public.announcements enable row level security;
alter table public.events enable row level security;
alter table public.media enable row level security;
alter table public.alumni enable row level security;
alter table public.membership_records enable row level security;
alter table public.download_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.website_files enable row level security;

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path=public as $$
  select coalesce((select role from public.profiles where id=auth.uid()), 'student'::public.app_role);
$$;

create policy "public read categories" on public.archive_categories for select using (is_public=true or public.current_role() in ('admin','super_admin'));
create policy "public read levels" on public.levels for select using (true);
create policy "public read semesters" on public.semesters for select using (true);
create policy "public read sessions" on public.sessions for select using (true);
create policy "public read courses" on public.courses for select using (true);
create policy "read documents by visibility" on public.documents for select using (status='published' and (visibility='public' or (visibility='student' and auth.uid() is not null) or public.current_role() in ('admin','super_admin')));
create policy "admin manage documents" on public.documents for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read public projects" on public.projects for select using (visibility='public' or (visibility='student' and auth.uid() is not null) or public.current_role() in ('admin','super_admin'));
create policy "admin manage projects" on public.projects for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read public administrations" on public.administrations for select using (true);
create policy "read executives" on public.executives for select using (true);
create policy "admin manage administrations" on public.administrations for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "admin manage executives" on public.executives for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read published announcements" on public.announcements for select using (published=true or public.current_role() in ('admin','super_admin'));
create policy "admin manage announcements" on public.announcements for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read events" on public.events for select using (true);
create policy "admin manage events" on public.events for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read media" on public.media for select using (true);
create policy "admin manage media" on public.media for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "read public alumni" on public.alumni for select using (visibility='public' or (visibility='student' and auth.uid() is not null) or public.current_role() in ('admin','super_admin'));
create policy "admin manage alumni" on public.alumni for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "own membership" on public.membership_records for select using (user_id=auth.uid() or public.current_role() in ('admin','super_admin'));
create policy "admin manage membership" on public.membership_records for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "own profile" on public.profiles for select using (id=auth.uid() or public.current_role() in ('admin','super_admin'));
create policy "admin manage profiles" on public.profiles for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "users log downloads" on public.download_logs for insert with check (auth.uid()=user_id or user_id is null);
create policy "admins read download logs" on public.download_logs for select using (public.current_role() in ('admin','super_admin'));
create policy "admins manage activity logs" on public.activity_logs for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
create policy "admins manage website files" on public.website_files for all using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));
