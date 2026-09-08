import { useEffect, useState } from 'react';
import { Menu, Search, Shield, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import SearchPage from './pages/SearchPage';
import AdminPage from './pages/AdminPage';

const routes = {
  '/': { title: 'Digital Archive', component: HomePage },
  '/about': { title: 'About NAMS', section: 'about' }, '/constitution': { title: 'Constitution & Policies', section: 'documents' },
  '/academics': { title: 'Academic Resources', section: 'academics' }, '/past-questions': { title: 'Past Questions', section: 'past-questions' },
  '/projects': { title: 'Project Library', section: 'projects' }, '/events': { title: 'Events & Media', section: 'events' },
  '/gallery': { title: 'Event Gallery', section: 'media' }, '/meetings': { title: 'Meeting Archive', section: 'meetings' },
  '/executives': { title: 'Executive Council', section: 'executives' }, '/administrations': { title: 'Administrations', section: 'administrations' },
  '/library': { title: 'Digital Library', section: 'library' }, '/downloads': { title: 'Downloads', section: 'downloads' },
  '/news': { title: 'News & Announcements', section: 'news' }, '/contact': { title: 'Contact NAMS FUTA', section: 'contact' },
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
  const [path, setPath] = useState(window.location.pathname || '/');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    const onClick = (event) => {
      const link = event.target.closest('a');
      if (!link || link.target || link.origin !== window.location.origin || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      event.preventDefault();
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
      setPath(url.pathname);
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
      <a className="brand" href="/" aria-label="NAMS FUTA Digital Archive home">
        <img className="brand-logo" src="/Public/MCB Class 29 official group 20260904_180458.jpg" alt="NAMS FUTA" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.hidden = false; }} />
        <span className="brand-logo-fallback" hidden aria-hidden="true">NAMS</span>
        <span className="brand-copy"><strong>NAMS</strong><small>FUTA DIGITAL ARCHIVE</small></span>
      </a>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
        <a href="/">Home</a><a href="/academics">Academics</a><a href="/administrations">Administration</a><a href="/about">About NAMS</a>
      </nav>
      <div className="header-actions"><a className="search-trigger" href="/search"><Search size={17} /><span>Search</span></a><a className="admin-link" href="/admin/login"><Shield size={16} /> Admin</a></div>
      <button className="menu-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>
    <main id="top">{path !== '/' && <section className="page-intro container"><p className="eyebrow">NAMS FUTA DIGITAL ARCHIVE</p><h1>{route.title}</h1><p>Preserving academic knowledge, institutional records and the history of NAMS FUTA.</p></section>}<Page route={route} /></main>
    <SiteFooter />
  </div>;
}

function SiteFooter() {
  return <footer className="footer" id="contact"><div className="container">
    <div className="nexus-credit"><span>Brought to you by</span><strong>TEAM NEXUS</strong></div>
    <div className="footer-grid"><div><strong>NAMS FUTA</strong><p>National Association of Microbiology Students<br />Federal University of Technology, Akure</p></div><div><span>Archive</span><a href="/academics">Academic Resources</a><a href="/past-questions">Past Questions</a><a href="/downloads">Downloads</a></div><div><span>NAMS</span><a href="/administrations">Administration</a><a href="/executives">Executive Council</a><a href="/about">About NAMS</a></div><div><span>Contact</span><a href="/contact">Contact Us</a><a href="/news">News</a><a href="/search">Search Archive</a></div></div>
    <div className="footer-credit-line"><span>Curated by Comr. Akinyele Timileyin (King David) — General Secretary</span><span>Built by Comr. Oluwafemi Mayowa (Ñøvã kïñg) — Assistant General Secretary</span></div>
    <div className="footer-bottom"><span>Understanding the Microbial World.</span><span>© NAMS FUTA</span></div>
  </div></footer>;
}
