import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, FileText, Loader2, Search as SearchIcon, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const sections = [
  ['All', ''], ['Documents', 'documents'], ['Projects', 'projects'], ['Events', 'events'], ['Meetings', 'meetings'], ['Leadership', 'executives'],
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [state, setState] = useState({ loading: false, rows: [], searched: false, error: null });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (initial) { setQuery(initial); runSearch(initial, filter); }
  }, []);

  async function runSearch(value = query, selected = filter) {
    const term = value.trim();
    if (!term || !supabase) return;
    setState({ loading: true, rows: [], searched: true, error: null });
    const rows = [];
    const jobs = [];
    if (!selected || selected === 'documents') jobs.push(searchDocuments(term));
    if (!selected || selected === 'projects') jobs.push(searchTable('projects', ['title','abstract','research_area'], term, 'project'));
    if (!selected || selected === 'events') jobs.push(searchTable('events', ['title','description','venue','event_category'], term, 'event'));
    if (!selected || selected === 'meetings') jobs.push(searchTable('meetings', ['title','description','venue','meeting_type'], term, 'meeting'));
    if (!selected || selected === 'executives') jobs.push(searchTable('executives', ['name','position','biography'], term, 'executive'));
    try { (await Promise.all(jobs)).forEach((items) => rows.push(...items)); rows.sort((a,b) => String(b.date || '').localeCompare(String(a.date || ''))); setState({ loading:false, rows:rows.slice(0,60), searched:true, error:null }); }
    catch (error) { setState({ loading:false, rows:[], searched:true, error:error?.message || 'Search failed.' }); }
  }

  async function searchDocuments(term) {
    const result = await supabase.rpc('search_public_documents', { search_query: term, result_limit: 50 });
    if (result.error) throw result.error;
    return (result.data || []).map((row) => ({ ...row, kind: 'document', date: row.year }));
  }

  async function searchTable(table, columns, term, kind) {
    const expression = columns.map((column) => `${column}.ilike.%${term.replace(/[%_]/g, '')}%`).join(',');
    let queryBuilder = supabase.from(table).select('*').or(expression).limit(30);
    if (table === 'projects') queryBuilder = queryBuilder.eq('visibility', 'public');
    if (table === 'events') queryBuilder = queryBuilder.not('status', 'in', '(draft,unpublished)');
    if (table === 'meetings') queryBuilder = queryBuilder;
    const result = await queryBuilder;
    if (result.error) throw result.error;
    return (result.data || []).map((row) => ({ ...row, kind, date: row.event_date || row.meeting_date || row.created_at }));
  }

  function submit(event) { event.preventDefault(); runSearch(); }

  return <section className="search-page container">
    <form className="large-search" onSubmit={submit} role="search"><SearchIcon size={21} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents, courses, projects, years…" aria-label="Search archive" /><button className="button button-primary" type="submit">Search</button></form>
    <div className="search-filters" role="group" aria-label="Search categories">{sections.map(([label,value]) => <button type="button" className={filter === value ? 'is-active' : ''} key={label} onClick={() => { setFilter(value); if (query.trim()) runSearch(query, value); }}>{label}</button>)}</div>
    {!state.searched && <div className="search-empty"><SearchIcon size={25} /><h2>Search the public archive.</h2><p>Find published documents, projects, events, meetings and leadership records from one place.</p></div>}
    {state.loading && <div className="empty-state"><Loader2 size={20} className="spin" /><div><h3>Searching the archive…</h3><p>Checking published institutional records.</p></div></div>}
    {state.error && <div className="empty-state"><FileText size={19} /><div><h3>Search is unavailable.</h3><p>{state.error}</p></div></div>}
    {!state.loading && !state.error && state.searched && (state.rows.length ? <div className="search-results">{state.rows.map((row) => <SearchResult key={`${row.kind}-${row.id}`} row={row} />)}</div> : <div className="search-empty"><FileText size={25} /><h2>No matching public records.</h2><p>Try a course code, document title, year, session, meeting or keyword.</p></div>)}
  </section>;
}

function SearchResult({ row }) {
  const kind = row.kind;
  const Icon = kind === 'event' ? CalendarDays : kind === 'executive' ? Users : kind === 'project' ? BookOpen : FileText;
  const title = row.title || row.name || row.full_name || row.file_name || 'Untitled record';
  const meta = row.category_name || row.category || row.position || row.event_category || row.meeting_type || row.year || kind;
  const href = kind === 'event' ? `/events/${row.id}` : kind === 'meeting' ? `/meetings/${row.id}` : kind === 'executive' ? `/executives/${row.administration_id || row.id}` : '#';
  return <article className="result-row"><div className="record-icon"><Icon size={18} /></div><div><span>{meta}</span><h2>{title}</h2><p>{row.description || row.abstract || row.biography || row.content || row.file_name || 'Published public archive record.'}</p>{href !== '#' && <a className="text-link" href={href}>Open record <ArrowRight size={15} /></a>}</div></article>;
}
