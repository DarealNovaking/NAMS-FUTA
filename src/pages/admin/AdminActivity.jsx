import { useEffect, useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminActivity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }
      const result = await supabase
        .from('activity_logs')
        .select('id,user_id,action,resource_type,resource_id,metadata,created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (result.error) setError(result.error.message);
      else setRows(result.data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="admin-shell">
      <div className="admin-crud-head">
        <div>
          <p className="eyebrow">SECURITY</p>
          <h1>Activity log</h1>
          <p>Review administrative actions recorded by the archive.</p>
        </div>
      </div>
      {error && <div className="form-error admin-error">{error}</div>}
      {loading ? (
        <div className="admin-empty"><Loader2 className="spin" /> Loading activity…</div>
      ) : (
        <div className="activity-list">
          {rows.length ? rows.map((row) => {
            const label = row.metadata?.title || row.resource_type || 'Archive';
            return (
              <div key={row.id}>
                <Activity size={16} />
                <div>
                  <strong>{row.action || 'Activity'}</strong>
                  <span>{label}{row.resource_id ? ` · ${row.resource_id}` : ''} · {new Date(row.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          }) : <div className="admin-empty">No activity recorded yet.</div>}
        </div>
      )}
    </main>
  );
}
