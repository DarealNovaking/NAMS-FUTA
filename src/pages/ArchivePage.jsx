import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Download, FileText, Image, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const config = {
  academics: { table: 'documents', title: 'Academic Resources', icon: BookOpen, filter: (q) => q.eq('status', 'published').eq('visibility', 'public').or('category.ilike.%academic%,category.ilike.%note%,category.ilike.%manual%') },
  'past-questions': { table: 'documents', title: 'Past Questions', icon: FileText, filter: (q) => q.eq('status', 'published').eq('visibility', 'public').or('category.ilike.%question%,category.ilike.%exam%,category.ilike.%test%') },
  projects: { table: 'projects', title: 'Project Library', icon: FileText, filter: (q) => q.eq('visibility', 'public') },
  events: { table: 'events', title: 'Events', icon: CalendarDays },
  media: { table: 'media', title: 'Event Gallery', icon: Image, filter: (q) => q.eq('visibility', 'public') },
  meetings: { table: 'meetings', title: 'Meeting Archive', icon: CalendarDays },
  administrations: { table: 'administrations', title: 'Administrations', icon: Users },
  executives: { table: 'executives', title: 'Executive Council', icon: Users },
  library: { table: 'documents', title: 'Digital Library', icon: BookOpen, filter: (q) => q.eq('status', 'published').eq('visibility', 'public') },
  downloads: { table: 'documents', title: 'Downloads', icon: Download, filter: (q) => q.eq('status', 'published').eq('visibility', 'public') },
  documents: { table: 'documents', title: 'Constitution & Policies', icon: FileText, filter: (q) => q.eq('status', 'published').eq('visibility', 'public').or('category.ilike.%constitution%,category.ilike.%policy%,category.ilike.%guideline%,category.ilike.%regulation%') },
  news: { table: 'announcements', title: 'News & Announcements', icon: FileText, filter: (q) => q.eq('published', true).or('publish_at.is.null,publish_at.lte.now()').or('expires_at.is.null,expires_at.gt.now()') },
  about: { table: 'site_settings', title: 'About NAMS', icon: Users },
  contact: { table: 'site_settings', title: 'Contact NAMS FUTA', icon: Users },
};

export default function ArchivePage({ route }) {
  const [state, setState] = useState({ loading: true, rows: [], error: null });
  const [settings, setSettings] = useState({});
  const section = route.section;
  const item = config[section] || config.downloads;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setState({ loading: false, rows: [], error: null }); return; }
      if (section === 'about' || section === 'contact') {
        const keys = section === 'about' ? ['about_nams', 'national_body'] : ['contact'];
        const result = await supabase.from('site_settings').select('key,value').in('key', keys);
        if (active) { setSettings(Object.fromEntries((result.data ?? []).map((r) => [r.key, r.value]))); setState({ loading: false, rows: [], error: result.error?.message }); }
        return;
      }
      let query = supabase.from(item.table).select('*');
      if (item.filter) query = item.filter(query);
      if (route.id) query = query.eq(section === 'executives' ? 'administration_id' : 'id', route.id);
      if (route.level) query = query.eq('level', route.level);
      if (route.course) query = query.eq('course', route.course);
      if (!route.id) {
        query = query.limit(60);
        if (section === 'administrations') query = query.order('start_date', { ascending: false });
        else if (section === 'executives') query = query.order('display_order', { ascending: true });
        else if (section === 'events') query = query.order('date', { ascending: false });
        else if (section === 'meetings') query = query.order('meeting_date', { ascending: false });
        else if (section === 'news') query = query.order('publish_at', { ascending: false });
        else query = query.order('created_at', { ascending: false });
      }
      const result = route.id ? await query.maybeSingle() : await query;
      if (active) setState({ loading: false, rows: route.id ? (result.data ? [result.data] : []) : (result.data ?? []), error: result.error?.message });
    }
    load();
    return () => { active = false; };
  }, [section, route.id, route.level, route.course]);

  if (section === 'about') return <AboutPage settings={settings} />;
  if (section === 'contact') return <ContactPage settings={settings} />;

  const Icon = item.icon;
  return <section className="archive-page container">
    {route.level && <LevelNotice level={route.level} />}
    {route.course && <CourseNotice course={route.course} />}
    {state.loading ? <LoadingState /> : state.error ? <EmptyState title="Archive records could not be loaded." text="The database returned an error. Check the Supabase connection and row-level security policies." /> : state.rows.length ? <div className="record-grid">{state.rows.map((row) => <RecordCard key={row.id} row={row} section={section} Icon={Icon} />)}</div> : <EmptyState title="No published records yet." text="This section is ready for authorized administrators to populate with real NAMS FUTA archive records." />}
  </section>;
}

function RecordCard({ row, section, Icon }) {
  const title = row.title || row.name || row.full_name || row.session || 'Untitled record';
  const meta = row.session || row.year || row.level || row.category || row.position || row.meeting_type || row.event_category || '';
  const description = row.description || row.abstract || row.content || row.biography || row.research_area || '';
  const href = section === 'events' ? `/events/${row.id}` : section === 'meetings' ? `/meetings/${row.id}` : section === 'executives' ? `/executives/${row.administration_id || row.id}` : section === 'news' ? `/news/${row.id}` : '#';
  return <article className="record-card"><div className="record-icon"><Icon size={19} /></div><div className="record-body"><span className="record-meta">{meta || 'Archive record'}</span><h2>{title}</h2>{description && <p>{String(description).slice(0, 180)}{String(description).length > 180 ? '…' : ''}</p>}{href !== '#' && <a className="text-link" href={href}>Open record <ArrowRight size={15} /></a>}{row.file_name && <span className="record-file"><FileText size={14} /> {row.file_name}</span>}</div></article>;
}

function LevelNotice({ level }) { return <div className="archive-notice"><BookOpen size={20} /><div><strong>{level} Level</strong><p>Browse published academic materials available for this level.</p></div></div>; }
function CourseNotice({ course }) { return <div className="archive-notice"><FileText size={20} /><div><strong>{course}</strong><p>Course-specific archive records will appear here when available.</p></div></div>; }
function LoadingState() { return <div className="empty-state"><div className="empty-icon" /><div><h3>Loading archive…</h3><p>Retrieving published records.</p></div></div>; }
function EmptyState({ title, text }) { return <div className="empty-state"><div className="empty-icon"><FileText size={19} /></div><div><h3>{title}</h3><p>{text}</p></div></div>; }

function AboutPage({ settings }) { const about = settings.about_nams || {}; const national = settings.national_body || {}; return <section className="content-page container"><div className="content-columns"><article><p className="eyebrow">OUR HISTORY</p><h2>{about.history || 'NAMS FUTA history will be published here.'}</h2><p>{about.vision || 'The association’s vision and institutional story will be maintained through editable site settings.'}</p></article><aside className="info-panel"><span>Mission</span><p>{about.mission || 'Not published yet.'}</p><span>National Body</span><p>{national.name || 'Not published yet.'}</p></aside></div><div className="empty-state"><div className="empty-icon"><Users size={19} /></div><div><h3>Built for institutional continuity</h3><p>History, objectives, values, organizational information and past presidents can be expanded without changing the application architecture.</p></div></div></section>; }
function ContactPage({ settings }) { const contact = settings.contact || {}; return <section className="content-page container"><div className="contact-panel"><p className="eyebrow">CONTACT</p><h2>Stay connected with NAMS FUTA.</h2><div className="contact-grid"><Info label="Email" value={contact.email} /><Info label="Phone" value={contact.phone} /><Info label="Address" value={contact.address} /><Info label="Social" value={contact.social || contact.instagram || contact.facebook} /></div></div></section>; }
function Info({ label, value }) { return <div><span>{label}</span><strong>{value || 'Not published yet.'}</strong></div>; }
