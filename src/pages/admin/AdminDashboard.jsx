import { useEffect, useState } from 'react';
import { Activity, Bell, BookOpen, CalendarDays, FileText, FolderOpen, LogOut, Settings, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';

const modules = [
  ['Documents', 'documents', FileText], ['Projects', 'projects', FolderOpen], ['Events', 'events', CalendarDays], ['Media', 'media', Activity],
  ['Meetings', 'meetings', CalendarDays], ['Administrations', 'administrations', Users], ['Executives', 'executives', Users], ['Announcements', 'announcements', Bell],
];

export default function AdminDashboard({ profile, onSignOut }) {
  const [counts, setCounts] = useState({});
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      const tables = modules.map(([, table]) => table);
      const results = await Promise.all(tables.map(async (table) => [table, await supabase.from(table).select('id', { count: 'exact', head: true })]));
      const next = Object.fromEntries(results.map(([table, result]) => [table, result.count ?? 0]));
      const logs = await supabase.from('activity_logs').select('id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(8);
      if (active) { setCounts(next); setRecent(logs.data ?? []); }
    }
    load(); return () => { active = false; };
  }, []);

  async function logout() { await signOut(); onSignOut(); }
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return <main className="admin-shell"><header className="admin-topbar"><div><p className="eyebrow">NAMS FUTA · ADMINISTRATION</p><h1>Archive control centre</h1><p>Welcome back, {profile?.full_name || profile?.username || 'Administrator'}.</p></div><button className="admin-logout" onClick={logout}><LogOut size={16} /> Sign out</button></header><section className="admin-stats"><div><span>Total indexed records</span><strong>{total}</strong></div><div><span>Your role</span><strong>{profile?.role || 'admin'}</strong></div><div><span>System state</span><strong>Protected</strong></div></section><section className="admin-modules"><div className="admin-section-head"><div><p className="eyebrow">ARCHIVE MODULES</p><h2>Manage institutional records.</h2></div><Settings size={20} /></div><div className="admin-module-grid">{modules.map(([label, table, Icon]) => <a href={`/admin/${table}`} className="admin-module" key={table}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{counts[table] ?? '—'} records</small></div><b>→</b></a>)}</div></section><section className="admin-activity"><div className="admin-section-head"><div><p className="eyebrow">AUDIT TRAIL</p><h2>Recent activity.</h2></div></div>{recent.length ? <div className="activity-list">{recent.map((log) => <div key={log.id}><Activity size={16} /><div><strong>{log.action || 'Activity'}</strong><span>{log.entity_type || 'Archive'} · {new Date(log.created_at).toLocaleString()}</span></div></div>)}</div> : <div className="admin-empty"><BookOpen size={20} /><p>No activity has been recorded yet.</p></div>}</section></main>;
}
