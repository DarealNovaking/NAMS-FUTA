import { useState } from 'react';
import { ArrowRight, FileText, Search as SearchIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: false, rows: [], searched: false, error: null });

  async function search(event) {
    event.preventDefault();
    const value = query.trim();
    if (!value || !supabase) return;
    setState({ loading: true, rows: [], searched: true, error: null });
    const result = await supabase.rpc('search_public_documents', { search_query: value, result_limit: 50 });
    setState({ loading: false, rows: result.data ?? [], searched: true, error: result.error?.message || null });
  }

  return <section className="search-page container">
    <form className="large-search" onSubmit={search} role="search"><SearchIcon size={21} /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents, courses, projects, years…" aria-label="Search archive" /><button className="button button-primary" type="submit">Search</button></form>
    {!state.searched && <div className="search-empty"><FileText size={25} /><h2>Search the public archive.</h2><p>Results come from the existing public-document search RPC and never include private or unpublished records.</p></div>}
    {state.loading && <div className="empty-state"><div className="empty-icon" /><div><h3>Searching…</h3><p>Looking through published public documents.</p></div></div>}
    {state.error && <div className="empty-state"><div className="empty-icon"><FileText size={19} /></div><div><h3>Search is unavailable.</h3><p>{state.error}</p></div></div>}
    {!state.loading && !state.error && state.searched && (state.rows.length ? <div className="search-results">{state.rows.map((row) => <article className="result-row" key={row.id || row.file_path || row.title}><div className="record-icon"><FileText size={18} /></div><div><span>{row.category || row.year || 'Archive document'}</span><h2>{row.title || row.file_name || 'Untitled document'}</h2><p>{row.description || row.file_name || 'Published public archive document.'}</p></div><ArrowRight size={18} /></article>)}</div> : <div className="search-empty"><FileText size={25} /><h2>No matching public records.</h2><p>Try a course code, document title, year, session or keyword.</p></div>)}
  </section>;
}
