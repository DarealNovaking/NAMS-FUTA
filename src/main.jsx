import React from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const archive = [
  ['Administration', 'Constitution · Policies · Executive Council · Minutes · Reports · Financial Records · Handover Notes'],
  ['Academic Resources', '100 Level · 200 Level · 300 Level · 400 Level · 500 Level'],
  ['Past Questions', 'Browse examination questions by level, course and session'],
  ['Project Library', 'Research projects, abstracts and academic work'],
  ['Events', 'Upcoming events and the NAMS historical event archive'],
  ['Media Gallery', 'Academic, social and institutional moments'],
  ['Alumni', 'The NAMS FUTA community beyond graduation'],
  ['Membership Records', 'Protected NAMS membership information'],
  ['Downloads', 'Central access to approved downloadable materials'],
  ['Website Files', 'Administrative website assets and documentation'],
];

function App() {
  return (
    <div className="site-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="nav">
        <a className="brand" href="#top" aria-label="NAMS FUTA home">
          <span className="brand-mark">N</span>
          <span><strong>NAMS</strong><small>FUTA</small></span>
        </a>
        <nav className="nav-links">
          <a href="#archive">Archive</a><a href="#academics">Academics</a><a href="#nams">NAMS</a><a href="#community">Community</a>
        </nav>
        <div className="nav-actions"><button className="search-button">Search</button><a className="login" href="#login">Student Login</a></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">NATIONAL ASSOCIATION OF MICROBIOLOGY STUDENTS · FUTA</p>
            <h1>Digital<br /><em>Archive.</em></h1>
            <p className="hero-text">The digital home for academic resources, institutional records, projects, events and the collective memory of microbiology students at FUTA.</p>
            <div className="hero-actions"><a className="primary" href="#archive">Explore Archive <span>↗</span></a><a className="secondary" href="#academics">Academic Resources</a></div>
          </div>
          <div className="science-orbit" aria-hidden="true">
            <div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="cell cell-a" /><div className="cell cell-b" /><div className="cell cell-c" /><div className="cell cell-d" /><div className="core">N</div>
          </div>
        </section>

        <section className="intro-strip"><span>UNDERSTANDING THE MICROBIAL WORLD</span><span>•</span><span>ACADEMIC · INSTITUTIONAL · COMMUNITY</span></section>

        <section className="section" id="archive">
          <div className="section-heading"><div><p className="eyebrow">THE REPOSITORY</p><h2>Explore the archive.</h2></div><p>One organized home for the knowledge, records and history of NAMS FUTA.</p></div>
          <div className="archive-grid">{archive.map(([title, description], i) => <a className={`archive-card card-${i + 1}`} href="#archive" key={title}><span className="card-index">0{i + 1}</span><div><h3>{title}</h3><p>{description}</p></div><span className="arrow">↗</span></a>)}</div>
        </section>

        <section className="search-panel" id="academics"><div><p className="eyebrow">FIND YOUR MATERIAL</p><h2>Search the NAMS archive.</h2><p>Find lecture materials, past questions, projects, records and more.</p></div><div className="search-field"><span>⌕</span><span>Search documents, courses, projects...</span><kbd>⌘ K</kbd></div></section>

        <section className="section feature-section" id="nams"><div className="feature-copy"><p className="eyebrow">ACADEMIC RESOURCES</p><h2>Five levels.<br /><em>One knowledge base.</em></h2><p>Move from 100 Level through 500 Level and find the materials you need, organized around the way microbiology students actually study.</p><a className="text-link" href="#archive">Browse academic resources <span>→</span></a></div><div className="level-stack">{['100','200','300','400','500'].map((level, i) => <div className="level-card" style={{'--i': i}} key={level}><span>{level}</span><small>LEVEL</small></div>)}</div></section>

        <section className="section community" id="community"><p className="eyebrow">NAMS COMMUNITY</p><h2>Preserving what<br /><em>came before.</em></h2><div className="community-grid"><div><strong>Executive Council</strong><p>Discover current and previous NAMS FUTA administrations.</p></div><div><strong>Events & Media</strong><p>Keep the moments, activities and milestones of the association accessible.</p></div><div><strong>Alumni</strong><p>Connect the history of NAMS with the microbiologists shaping tomorrow.</p></div></div></section>
      </main>

      <footer className="footer"><div className="nexus-credit"><span>Brought to you by</span><strong>TEAM NEXUS</strong></div><div className="footer-grid"><div><strong>NAMS FUTA</strong><p>National Association of Microbiology Students<br />Federal University of Technology, Akure</p></div><div><span>Archive</span><a href="#archive">Digital Archive</a><a href="#academics">Academic Resources</a><a href="#archive">Past Questions</a></div><div><span>NAMS</span><a href="#nams">Administration</a><a href="#nams">Executive Council</a><a href="#community">Alumni</a></div><div><span>Community</span><a href="#community">Events</a><a href="#community">Media Gallery</a><a href="#top">Contact</a></div></div><div className="footer-bottom"><span>Understanding the Microbial World.</span><span>© NAMS FUTA</span></div></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
