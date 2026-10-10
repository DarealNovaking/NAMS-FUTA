import { useEffect, useState } from 'react';
import { Menu, Search, Shield, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';
import { supabase } from './lib/supabase';

const BASE_URL = import.meta.env.BASE_URL || '/';
const BASE_PATH = BASE_URL === '/' ? '' : BASE_URL.replace(/\/$/, '');

function appPath(pathname) {
  if (!BASE_PATH) return pathname || '/';
  if (pathname === BASE_PATH || pathname === BASE_URL) return '/';
  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) || '/' : pathname;
}

function siteHref(pathname = '/') {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return BASE_PATH ? `${BASE_PATH}${normalized === '/' ? '/' : normalized}` : normalized;
}

function getInitialPath() {
  let pathname = window.location.pathname || '/';
  let search = window.location.search || '';
  let hash = window.location.hash || '';
  try {
    const savedRoute = window.sessionStorage.getItem('spa-route');
    if (savedRoute) {
      window.sessionStorage.removeItem('spa-route');
      const restored = new URL(savedRoute.startsWith('/') ? savedRoute : `/${savedRoute}`, window.location.origin);
      pathname = restored.pathname.startsWith('/') ? restored.pathname : `/${restored.pathname}`;
      search = restored.search;
      hash = restored.hash;
      const canonicalPath = siteHref(appPath(pathname));
      window.history.replaceState({}, '', `${canonicalPath}${search}${hash}`);
    }
  } catch {
    // Storage can be unavailable in privacy-restricted browsing; normal routing still works.
  }
  return appPath(pathname);
}

const routes = {
  '/': { title: 'Digital Archive', component: HomePage },
  '/about': { title: 'About NAMS', section: 'about' }, '/constitution': { title: 'Constitution & Policies', section: 'documents' },
  '/academics': { title: 'Academic Resources', section: 'academics' }, '/past-questions': { title: 'Past Questions', section: 'past-questions' },
  '/projects': { title: 'Project Library', section: 'projects' }, '/events': { title: 'Events & Media', section: 'events' },
  '/gallery': { title: 'Event Gallery', section: 'media' }, '/meetings': { title: 'Meeting Archive', section: 'meetings' },
  '/executives': { title: 'Executive Council', section: 'executives' }, '/administrations': { title: 'Administrations', section: 'administrations' },
  '/library': { title: 'Digital Library', section: 'library' }, '/downloads': { title: 'Downloads', section: 'downloads' },
  '/news': { title: 'News & Announcements', section: 'news' }, '/reports': { title: 'Annual Reports', section: 'reports' }, '/financial-records': { title: 'Financial Records', section: 'financial-records' }, '/handover-notes': { title: 'Handover Notes', section: 'handover-notes' }, '/alumni': { title: 'Alumni Directory', section: 'alumni' }, '/contact': { title: 'Contact NAMS FUTA', section: 'contact' },
};

function getRoute(pathname) {
  if (pathname === '/admin' || pathname === '/admin/login' || pathname.startsWith('/admin/')) return { title: 'Administration', section: 'admin' };
  if (pathname.startsWith('/academics/')) return { title: `${pathname.split('/').pop()} Level`, section: 'academics', level: pathname.split('/').pop() };
  if (pathname.startsWith('/past-questions/')) return { title: 'Course Past Questions', section: 'past-questions', course: decodeURIComponent(pathname.split('/').pop()) };
  if (pathname.startsWith('/events/')) return { title: 'Event', section: 'events', id: pathname.split('/').pop() };
  if (pathname.startsWith('/meetings/')) return { title: 'Meeting', section: 'meetings', id: pathname.split('/').pop() };
  if (pathname.startsWith('/executives/')) return { title: 'Administration', section: 'executives', id: pathname.split('/').pop() };
  if (pathname.startsWith('/news/')) return { title: 'Announcement', section: 'news', id: pathname.split('/').pop() };
  return routes[pathname] || { title: 'Archive', section: 'search' };
}

export default function App() {
  const [path, setPath] = useState(getInitialPath());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [footerCredits, setFooterCredits] = useState(null);

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.from('site_settings').select('value').eq('key', 'footer_credits').maybeSingle().then(({ data }) => {
      if (mounted) setFooterCredits(data?.value ?? null);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onPop = () => setPath(appPath(window.location.pathname || '/'));
    window.addEventListener('popstate', onPop);
    const onClick = (event) => {
      const link = event.target.closest('a');
      if (!link || link.target || link.origin !== window.location.origin || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      event.preventDefault();
      const nextPath = BASE_PATH && (url.pathname === BASE_PATH || url.pathname.startsWith(`${BASE_PATH}/`)) ? url.pathname : siteHref(url.pathname);
      window.history.pushState({}, '', `${nextPath}${url.search}${url.hash}`);
      setPath(appPath(nextPath));
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.addEventListener('click', onClick);
    return () => { window.removeEventListener('popstate', onPop); document.removeEventListener('click', onClick); };
  }, []);

  const route = getRoute(path);
  if (route.section === 'admin') return <AdminPage />;
  const Page = route.section === 'search' ? SearchPage : route.section ? ArchivePage : route.component;

  return <div className="site-shell">
    <div className="ambient ambient-one" aria-hidden="true" />
    <div className="ambient ambient-two" aria-hidden="true" />
    <header className="site-header">
      <a className="brand" href={siteHref("/")} aria-label="NAMS FUTA Digital Archive home">
        <img className="brand-logo" src={`${BASE_URL}Public/MCB%20Class%2029%20official%20group%2020260904_180458.jpg`} alt="Official National Association of Microbiology Students, FUTA logo" width="46" height="46" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; }} />
        <span className="brand-logo-fallback" hidden aria-hidden="true">NAMS</span>
        <span className="brand-copy"><strong>NAMS</strong><small>FUTA DIGITAL ARCHIVE</small></span>
      </a>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <a href="/">Home</a><a href={siteHref("/academics")}>Academics</a><a href={siteHref("/administrations")}>Administration</a><a href={siteHref("/about")}>About NAMS</a>
      </nav>
      <div className="header-actions"><a className="search-trigger" href={siteHref("/search")}><Search size={17} /><span>Search</span></a><a className="admin-link" href={siteHref("/admin/login")}><Shield size={16} /> Admin</a></div>
      <button className="menu-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    <main id="top">{path !== '/' && <section className="page-intro container"><p className="eyebrow">NAMS FUTA DIGITAL ARCHIVE</p><h1>{route.title}</h1><p>Preserving academic knowledge, institutional records and the history of NAMS FUTA.</p></section>}<Page route={route} /></main>
    <SiteFooter credits={footerCredits} />
  </div>;
}

function SiteFooter({ credits }) {
  const curatedBy = credits?.curated_by || credits?.curatedBy || 'Comr. Akinyele Timileyin (King David) — General Secretary';
  const builtBy = credits?.built_by || credits?.builtBy || 'Comr. Oluwafemi Mayowa (Ñøvã kïñg) — Assistant General Secretary';
  return <footer className="footer" id="contact"><div className="container">
    <div className="nexus-credit"><span>Brought to you by</span><strong>TEAM NEXUS</strong></div>
    <div className="footer-grid"><div><strong>NAMS FUTA</strong><p>National Association of Microbiology Students<br />Federal University of Technology, Akure</p></div><div><span>Archive</span><a href="/academics">Academic Resources</a><a href={siteHref("/past-questions")}>Past Questions</a><a href={siteHref("/downloads")}>Downloads</a></div><div><span>NAMS</span><a href="/administrations">Administration</a><a href={siteHref("/executives")}>Executive Council</a><a href="/about">About NAMS</a></div><div><span>Contact</span><a href={siteHref("/contact")}>Contact Us</a><a href={siteHref("/news")}>News</a><a href="/search">Search Archive</a></div></div>
    <div className="footer-credit-line"><span>Curated by {curatedBy}</span><span>Built by {builtBy}</span></div>
    <div className="footer-bottom"><span>Understanding the Microbial World.</span><span>© NAMS FUTA</span></div>
  </div></footer>;
}
