create extension if not exists pg_trgm;

alter table public.documents
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists license_type text,
  add column if not exists rights_note text;

create index if not exists documents_event_id_idx on public.documents(event_id);
create index if not exists documents_title_trgm_idx on public.documents using gin (title gin_trgm_ops);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  administration_id uuid references public.administrations(id) on delete set null,
  year integer not null,
  meeting_type text not null check (meeting_type in ('executive','congress','emergency','committee')),
  title text not null,
  meeting_date date,
  venue text,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.meetings enable row level security;
create index if not exists meetings_year_type_idx on public.meetings(year, meeting_type);

create table if not exists public.meeting_documents (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  document_type text not null check (document_type in ('notice','agenda','attendance','minutes','resolution','supporting_document')),
  document_id uuid not null references public.documents(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(meeting_id, document_type, document_id)
);
alter table public.meeting_documents enable row level security;

create table if not exists public.event_documents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  document_type text not null check (document_type in ('proposal','budget','invitation','speakers','programme','attendance','slides','report','supporting_document')),
  document_id uuid not null references public.documents(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(event_id, document_type, document_id)
);
alter table public.event_documents enable row level security;

alter table public.membership_records
  add column if not exists full_name text,
  add column if not exists matric_number text,
  add column if not exists email text,
  add column if not exists phone text;

create table if not exists public.handover_records (
  id uuid primary key default gen_random_uuid(),
  from_administration_id uuid references public.administrations(id) on delete set null,
  to_administration_id uuid references public.administrations(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','in_progress','completed')),
  checklist jsonb not null default '{}'::jsonb,
  notes text,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.handover_records enable row level security;

insert into public.site_settings(key, value)
values
 ('site_identity', '{"name":"NAMS FUTA Digital Archive","tagline":"Understanding the Microbial World","institution":"National Association of Microbiology Students, Federal University of Technology Akure"}'::jsonb),
 ('footer_credits', '{"brought_to_you_by":"TEAM NEXUS","curated_by":"Comr. Akinyele Timileyin (King David)","curated_role":"General Secretary","built_by":"Comr. Oluwafemi Mayowa (Ñøvã kïñg)","built_role":"Assistant General Secretary"}'::jsonb),
 ('contact', '{"email":"","phone":"","address":"","socials":{},"enquiry_form":""}'::jsonb)
on conflict (key) do nothing;

create policy "public read site settings" on public.site_settings for select to public using (true);
create policy "admins manage site settings" on public.site_settings for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

create policy "public read meetings" on public.meetings for select to public using (true);
create policy "admins manage meetings" on public.meetings for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

create policy "public read meeting documents" on public.meeting_documents for select to public using (true);
create policy "admins manage meeting documents" on public.meeting_documents for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

create policy "public read event documents" on public.event_documents for select to public using (true);
create policy "admins manage event documents" on public.event_documents for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

create policy "admins manage handover records" on public.handover_records for all to public using (public.current_role() in ('admin','super_admin')) with check (public.current_role() in ('admin','super_admin'));

create index if not exists membership_records_matric_idx on public.membership_records(matric_number);
create index if not exists membership_records_name_idx on public.membership_records(full_name);
