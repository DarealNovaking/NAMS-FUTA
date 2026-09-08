import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, BookOpen, CalendarDays, ClipboardList, FileText, FolderOpen, LogOut, Search, Settings, ShieldCheck, Users, UserCog } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';

const groups = [
  { label: 'Archive', items: [['Documents', 'documents', FileText], ['Projects', 'projects', FolderOpen], ['Events', 'events', CalendarDays], ['Media', 'media', Activity], ['Meetings', 'meetings', CalendarDays]] },
  { label: 'Institution', items: [['Administrations', 'administrations', Users], ['Executives', 'executives', Users], ['Members', 'members', Users], ['Alumni', 'alumni', Users], ['Announcements', 'announcements', Bell]] },
  { label: 'Continuity & security', items: [['Handover', 'handover', ClipboardList], ['Settings', 'settings', Settings], ['Activity', 'activity', Activity], ['Admins', 'admins', UserCog]] }
];

export default function AdminDashboard({ profile, onSignOut }) {
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const modules = useMemo(() => groups.flatMap((group) => group.items.map(([label, table, Icon]) => ({ label, table, Icon, group: group.label }))), []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!supabase) return;
      const tables = modules.map(({ table }) => table).filter((table) => !['handover', 'settings', 'admins', 'activity'].includes(table));
      const results = await Promise.all(tables.map(async (table) => [table, await supabase.from(table).select('id', { count: 'exact', head: true })]));
      const next = Object.fromEntries(results.map(([table, result]) => [table, result.count ?? 0]));
      const logs = await supabase.from('activity_logs').select('id,action,resource_type,resource_id,metadata,created_at').order('created_at', { ascending: false }).limit(8);
      if (active) { setCounts(next); setRecent(logs.data || []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [modules]);

  async function logout() { await signOut(); onSignOut(); }

  const filteredGroups = groups.map((group) => ({
    ...group,
    items: group.items.filter(([label, table]) => `${label} ${table} ${group.label}`.toLowerCase().includes(query.trim().toLowerCase()))
  })).filter((group) => group.items.length);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><p className="eyebrow">NAMS FUTA · ADMINISTRATION</p><h1>Archive control centre</h1><p>One place to curate documents, people, events, leadership and institutional continuity.</p></div>
        <div className="admin-top-actions"><span className="admin-role-badge"><ShieldCheck size={15} /> {profile?.role || 'admin'}</span><button className="admin-logout" onClick={logout}><LogOut size={16} /> Sign out</button></div>
      </header>

      <section className="admin-stats" aria-label="Archive overview">
        <div><span>Total indexed records</span><strong>{loading ? '—' : total}</strong></div>
        <div><span>Administrator</span><strong>{profile?.full_name || profile?.username || 'Administrator'}</strong></div>
        <div><span>System state</span><strong><span className="admin-state"><i /> Protected</span></strong></div>
      </section>

      <section className="admin-command-bar"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find an administration module…" aria-label="Find an administration module" /><kbd>⌘ K</kbd></section>

      {filteredGroups.map((group) => (
        <section className="admin-modules" key={group.label}>
          <div className="admin-section-head"><div><p className="eyebrow">{group.label.toUpperCase()}</p><h2>Manage {group.label.toLowerCase()}.</h2></div></div>
          <div className="admin-module-grid">{group.items.map(([label, table, Icon]) => <a href={`/admin/${table}`} className="admin-module" key={table}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{counts[table] ?? '—'} records</small></div><b>→</b></a>)}</div>
        </section>
      ))}

      <section className="admin-activity">
        <div className="admin-section-head"><div><p className="eyebrow">AUDIT TRAIL</p><h2>Recent activity.</h2></div><a className="admin-text-link" href="/admin/activity">View full log →</a></div>
        {recent.length ? <div className="activity-list">{recent.map((log) => <div key={log.id}><Activity size={16} /><div><strong>{log.action || 'Activity'}</strong><span>{log.metadata?.title || log.resource_type || 'Archive'}{log.resource_id ? ` · ${log.resource_id}` : ''} · {new Date(log.created_at).toLocaleString()}</span></div></div>)}</div> : <div className="admin-empty"><BookOpen size={20} /><p>No activity has been recorded yet.</p></div>}
      </section>
    </main>
  );
}
