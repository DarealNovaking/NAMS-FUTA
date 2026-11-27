alter table public.projects add column if not exists research_area text;
create index if not exists projects_research_area_idx on public.projects(research_area);

alter table public.media add column if not exists media_type text;
create index if not exists media_category_type_idx on public.media(category, media_type);

alter table public.events add column if not exists event_category text;
create index if not exists events_category_idx on public.events(event_category);

alter table public.announcements add column if not exists category text;
create index if not exists announcements_category_idx on public.announcements(category);

insert into public.site_settings(key, value) values
('quick_access', '{"items":[{"label":"Constitution","path":"/archive/constitution"},{"label":"Academic Resources","path":"/academics"},{"label":"Meeting Minutes","path":"/meetings"},{"label":"Executive Council","path":"/executives"},{"label":"Event Gallery","path":"/gallery"},{"label":"Past Questions","path":"/past-questions"},{"label":"Annual Reports","path":"/reports"},{"label":"Downloads","path":"/downloads"},{"label":"News","path":"/news"},{"label":"Contact Us","path":"/contact"}]}'::jsonb),
('digital_library', '{"categories":["Microbiology Textbooks","Research Papers","WHO Publications","NCDC Guidelines","Laboratory SOPs"]}'::jsonb),
('download_centre', '{"categories":["Constitution","Membership Form","SIWES Forms","Project Guide","Academic Resources","Meeting Templates"]}'::jsonb),
('search_config', '{"fields":["document_name","year","executive_session","course_code","event","category"]}'::jsonb)
on conflict (key) do nothing;

create index if not exists documents_title_idx on public.documents(title);
create index if not exists documents_year_idx on public.documents(year);
create index if not exists documents_slug_idx on public.documents(slug);

create or replace function public.search_public_documents(search_query text, result_limit integer default 50)
returns table(id uuid, title text, slug text, description text, year integer, file_type text, category_id uuid, level_id uuid, course_id uuid, session_id uuid, visibility visibility_level)
language sql stable security invoker set search_path = public
as $$
  select d.id, d.title, d.slug, d.description, d.year, d.file_type, d.category_id, d.level_id, d.course_id, d.session_id, d.visibility
  from public.documents d
  where d.status = 'published' and d.visibility = 'public'
    and (nullif(trim(search_query), '') is null or d.title ilike '%' || trim(search_query) || '%' or d.description ilike '%' || trim(search_query) || '%' or d.file_name ilike '%' || trim(search_query) || '%')
  order by d.created_at desc
  limit greatest(1, least(result_limit, 100));
$$;
