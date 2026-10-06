import { useEffect, useState } from 'react';
import {
  ArrowRight, BookOpen, CalendarDays, ChevronRight, FileText, GraduationCap,
  Library, Menu, Search, Shield, Users, X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const fallbackQuickAccess = [
  ['Constitution', '/constitution', FileText], ['Academic Resources', '/academics', GraduationCap],
  ['Meeting Minutes', '/meetings', CalendarDays], ['Executive Council', '/executives', Users],
  ['Event Gallery', '/gallery', Library], ['Past Questions', '/past-questions', BookOpen],
  ['Annual Reports', '/downloads?category=annual-report', FileText], ['Downloads', '/downloads', ArrowRight],
  ['News', '/news', FileText], ['Contact Us', '/contact', Users],
];

const archiveAreas = [
  ['01', 'Administration', 'Executives, meetings, reports, policies and handover records.', '/administrations'],
  ['02', 'Academic Resources', 'Level-based learning materials for microbiology students.', '/academics'],
  ['03', 'Past Questions', 'A structured home for course questions and available guides.', '/past-questions'],
  ['04', 'Project Library', 'Research projects, abstracts, seminars and publications.', '/projects'],
  ['05', 'Events & Media', 'Institutional events, photographs, videos and milestones.', '/events'],
  ['06', 'Alumni & Community', 'Public alumni records and the wider institutional community.', '/alumni'],
  ['07', 'Downloads & Website Files', 'Approved downloadable resources and maintained website files.', '/downloads'],
  ['08', 'Digital Library', 'Curated references with clear rights and access information.', '/library'],
];

function readSetting(row) { return row?.value ?? row?.setting_value ?? null; }

export default function HomePage() {
  const [settings, setSettings] = useState({});
  const [currentAdministration, setCurrentAdministration] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const [settingsResult, administrationResult, announcementsResult] = await Promise.all([
        supabase.from('site_settings').select('key, value').in('key', ['site_identity', 'footer_credits', 'quick_access', 'contact', 'about_nams']),
        supabase.from('administrations').select('id, name, session_id, start_date, end_date, is_current, sessions(name)').eq('is_current', true).maybeSingle(),
        supabase.from('announcements').select('id, title, content, category, priority, publish_at, expires_at').eq('published', true).or('publish_at.is.null,publish_at.lte.now()').or('expires_at.is.null,expires_at.gt.now()').order('priority', { ascending: false }).order('publish_at', { ascending: false }).limit(3),
      ]);
      if (!mounted) return;
      if (!settingsResult.error) setSettings(Object.fromEntries((settingsResult.data ?? []).map((row) => [row.key, readSetting(row)])));
      if (!administrationResult.error) setCurrentAdministration(administrationResult.data);
      if (!announcementsResult.error) setAnnouncements(announcementsResult.data ?? []);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const identity = settings.site_identity || {};
  const institutionName = identity.name || identity.title || 'NAMS FUTA Digital Archive';
  const institutionTagline = identity.tagline || 'Understanding the Microbial World.';
  const quickAccess = Array.isArray(settings.quick_access)
    ? settings.quick_access.map((item, index) => [item.label || item.title || `Archive ${index + 1}`, item.href || '/search', FileText])
    : fallbackQuickAccess;

  return <>
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">NATIONAL ASSOCIATION OF MICROBIOLOGY STUDENTS · FUTA</p>
        <div className="hero-identity"><span>{institutionName}</span><b>·</b><span>{institutionTagline}</span></div>
        <h1>Institutional memory,<br /><em>built to last.</em></h1>
        <p className="hero-text">The permanent digital home for NAMS FUTA's academic resources, institutional records, administrations, projects, events and community history.</p>
        <div className="hero-actions"><a className="button button-primary" href="/search">Explore the Archive <ArrowRight size={17} /></a><a className="button button-secondary" href="/academics">Academic Resources</a></div>
      </div>
      <div className="science-stage" aria-hidden="true"><div className="science-grid" /><div className="orbital orbital-one" /><div className="orbital orbital-two" /><div className="cell-node node-one" /><div className="cell-node node-two" /><div className="cell-node node-three" /><div className="cell-core"><span>N</span></div></div>
    </section>
    <section className="ticker" aria-label="Archive statement"><span>UNDERSTANDING THE MICROBIAL WORLD</span><b>•</b><span>ACADEMIC · INSTITUTIONAL · COMMUNITY</span><b>•</b><span>THE NAMS FUTA DIGITAL ARCHIVE</span></section>

    <section className="section container"><div className="section-heading"><div><p className="eyebrow">THE REPOSITORY</p><h2>Everything has a place.</h2></div><div><p>A structured archive designed so today's records remain useful to tomorrow's administration.</p><a className="text-link repository-link" href="/search">Explore the full archive <ArrowRight size={16} /></a></div></div><div className="archive-grid">{archiveAreas.map(([index, title, description, href]) => <a className="archive-card" href={href} key={title}><span className="card-index">{index}</span><div><h3>{title}</h3><p>{description}</p></div><ChevronRight className="card-arrow" size={20} /></a>)}</div></section>

    <section className="quick-section container"><div className="section-heading compact"><div><p className="eyebrow">QUICK ACCESS</p><h2>Start anywhere.</h2></div></div><div className="quick-grid">{quickAccess.map(([label, href, Icon]) => <a className="quick-link" href={href} key={label}><Icon size={17} /><span>{label}</span><ArrowRight size={15} /></a>)}</div></section>

    <section className="search-panel container"><div><p className="eyebrow">ARCHIVE SEARCH</p><h2>Find what you're looking for.</h2><p>Search published public documents across titles, descriptions and file names.</p></div><a className="search-box" href="/search"><Search size={19} /><span>Search documents, courses, projects...</span><kbd>⌘ / Ctrl K</kbd></a></section>

    <section className="feature-section section container"><div className="feature-copy"><p className="eyebrow">ACADEMIC RESOURCES</p><h2>Five levels.<br /><em>One knowledge base.</em></h2><p>Academic content is organized by level, course and session as real archive records are added.</p><a className="text-link" href="/academics">Browse academic archive <ArrowRight size={16} /></a></div><div className="level-stack" aria-label="Academic levels">{['100', '200', '300', '400', '500'].map((level, index) => <a className="level-card" style={{ '--i': index }} href={`/academics/${level}`} key={level}><strong>{level}</strong><span>LEVEL</span></a>)}</div></section>

    <section className="current-section section container"><div className="current-copy"><p className="eyebrow">CURRENT ADMINISTRATION</p><h2>{currentAdministration?.name || currentAdministration?.sessions?.name || 'Current administration'}</h2><p>{currentAdministration ? 'The active administration is linked directly to the archive database.' : 'No current administration has been published yet.'}</p><a className="button button-secondary" href="/administrations">View administrations</a></div><div className="status-card"><span className="status-dot" />{loading ? 'Checking archive…' : currentAdministration ? 'Active administration' : 'Awaiting archive record'}<strong>{currentAdministration?.sessions?.name || 'Not configured'}</strong></div></section>

    <section className="announcement-section section container"><div className="section-heading compact"><div><p className="eyebrow">NEWS & ANNOUNCEMENTS</p><h2>What's happening.</h2></div></div>{announcements.length ? <div className="announcement-list">{announcements.map((item) => <article className="announcement" key={item.id}><span>{item.category || 'Announcement'}</span><h3>{item.title}</h3><p>{item.content}</p></article>)}</div> : <EmptyState title="No announcements available yet." text="Published announcements will appear here when they are added by an authorized administrator." />}</section>

    <section className="about-section section container"><div><p className="eyebrow">ABOUT NAMS FUTA</p><h2>An archive for every administration.</h2></div><div><p>{settings.about_nams?.history || 'NAMS FUTA institutional history will be displayed here once it has been published through site settings.'}</p><a className="text-link" href="/about">Learn more about NAMS <ArrowRight size={16} /></a></div></section>
    <section className="archive-note-section container"><div className="archive-note"><div><p className="eyebrow">BUILT FOR CONTINUITY</p><h2>Not just a website. An institutional memory.</h2></div><p>Every published record is intended to remain discoverable across administrations, with controlled access for sensitive material and a clear editorial trail.</p></div></section>

    <section className="empty-section container"><EmptyState title="The public archive is ready for real records." text="No documents are fabricated to fill the interface. Authorized administrators can publish the Constitution, policies, reports and other institutional records as they become available." /></section>
  </>;
}

function EmptyState({ title, text }) { return <div className="empty-state"><div className="empty-icon"><FileText size={19} /></div><div><h3>{title}</h3><p>{text}</p></div></div>; }
