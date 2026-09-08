import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, Loader2, Plus, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCurrentProfile } from '../../lib/auth';

const DEFAULT_CHECKLIST = {
  constitution: false,
  financial_records: false,
  academic_archive: false,
  membership_records: false,
  event_records: false,
  passwords_and_access: false,
  assets_and_inventory: false,
  outstanding_matters: false,
  final_report: false,
};

const STATUS = ['draft', 'in_progress', 'completed'];

export default function AdminHandover() {
  const [rows, setRows] = useState([]);
  const [administrations, setAdministrations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ from_administration_id: '', to_administration_id: '', status: 'draft', notes: '', checklist: DEFAULT_CHECKLIST });

  const administrationMap = useMemo(() => Object.fromEntries(administrations.map((item) => [item.id, item])), [administrations]);

  async function load() {
    if (!supabase) return;
    setLoading(true);
    const [handover, adminResult] = await Promise.all([
      supabase.from('handover_records').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('administrations').select('*').order('start_date', { ascending: false }).limit(100),
    ]);
    if (handover.error) setError(handover.error.message);
    else setRows(handover.data || []);
    if (adminResult.error) setError((current) => current || adminResult.error.message);
    else setAdministrations(adminResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    getCurrentProfile().then(({ profile: current }) => setProfile(current));
    load();
  }, []);

  function openCreate() {
    setForm({ from_administration_id: '', to_administration_id: '', status: 'draft', notes: '', checklist: { ...DEFAULT_CHECKLIST } });
    setError('');
    setMessage('');
    setShow(true);
  }

  function toggleChecklist(key) {
    setForm((current) => ({ ...current, checklist: { ...current.checklist, [key]: !current.checklist[key] } }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    if (!form.from_administration_id || !form.to_administration_id) {
      setError('Select both the outgoing and incoming administration.');
      setSaving(false);
      return;
    }
    if (form.from_administration_id === form.to_administration_id) {
      setError('Outgoing and incoming administrations must be different.');
      setSaving(false);
      return;
    }

    const completed = form.status === 'completed';
    const payload = {
      from_administration_id: form.from_administration_id,
      to_administration_id: form.to_administration_id,
      status: form.status,
      notes: form.notes.trim() || null,
      checklist: form.checklist,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? profile?.id || null : null,
      created_by: profile?.id || null,
    };
    const result = await supabase.from('handover_records').insert(payload).select().single();
    if (result.error) setError(result.error.message);
    else {
      await supabase.from('activity_logs').insert({
        user_id: profile?.id || null,
        action: 'create',
        resource_type: 'handover_records',
        resource_id: result.data.id,
        metadata: { status: form.status, from_administration_id: form.from_administration_id, to_administration_id: form.to_administration_id },
      });
      setMessage('Handover record created.');
      setShow(false);
      await load();
    }
    setSaving(false);
  }

  return (
    <main className="admin-shell">
      <div className="admin-crud-head">
        <div>
          <p className="eyebrow">CONTINUITY</p>
          <h1>Handover</h1>
          <p>Preserve the transfer of records, responsibilities and institutional knowledge between administrations.</p>
        </div>
        <button className="admin-primary" onClick={openCreate}><Plus size={17} /> New handover</button>
      </div>

      {error && <div className="form-error admin-error">{error}</div>}
      {message && <div className="admin-success">{message}</div>}

      {loading ? <div className="admin-empty"><Loader2 className="spin" /> Loading continuity records…</div> : rows.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Outgoing</th><th>Incoming</th><th>Status</th><th>Checklist</th><th>Completed</th></tr></thead>
            <tbody>{rows.map((row) => {
              const checklist = row.checklist && typeof row.checklist === 'object' ? row.checklist : {};
              const total = Object.keys(checklist).length;
              const done = Object.values(checklist).filter(Boolean).length;
              return <tr key={row.id}>
                <td>{administrationMap[row.from_administration_id]?.name || row.from_administration_id}</td>
                <td>{administrationMap[row.to_administration_id]?.name || row.to_administration_id}</td>
                <td><span className={`status-pill status-${row.status === 'completed' ? 'published' : row.status === 'draft' ? 'draft' : 'archived'}`}>{row.status.replace('_', ' ')}</span></td>
                <td>{done}/{total} complete</td>
                <td>{row.completed_at ? new Date(row.completed_at).toLocaleDateString() : '—'}</td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      ) : <div className="admin-empty"><ClipboardCheck size={19} /> No handover records yet.</div>}

      {show && <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShow(false)}>
        <form className="admin-modal" onSubmit={save}>
          <div className="admin-modal-head"><div><p className="eyebrow">NEW HANDOVER</p><h2>Create transition record</h2></div><button type="button" onClick={() => setShow(false)} aria-label="Close"><X /></button></div>
          <div className="admin-form-grid">
            <label>Outgoing administration *<select required value={form.from_administration_id} onChange={(e) => setForm({ ...form, from_administration_id: e.target.value })}><option value="">Select…</option>{administrations.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label>Incoming administration *<select required value={form.to_administration_id} onChange={(e) => setForm({ ...form, to_administration_id: e.target.value })}><option value="">Select…</option>{administrations.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
            <label>Status *<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="full">Notes<textarea rows="4" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Outstanding matters, transition notes, important context…" /></label>
            <div className="full handover-checklist"><strong>Continuity checklist</strong><div className="handover-check-grid">{Object.entries(form.checklist).map(([key, checked]) => <label key={key}><input type="checkbox" checked={Boolean(checked)} onChange={() => toggleChecklist(key)} /><span>{key.replaceAll('_', ' ')}</span>{checked && <CheckCircle2 size={15} />}</label>)}</div></div>
          </div>
          <div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={() => setShow(false)}>Cancel</button><button className="admin-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save handover'}</button></div>
        </form>
      </div>}
    </main>
  );
}
