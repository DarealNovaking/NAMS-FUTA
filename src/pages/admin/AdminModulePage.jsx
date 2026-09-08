import { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCurrentProfile } from '../../lib/auth';

const configs = {
  projects: {
    title: 'Projects',
    description: 'Manage archived student research and project records.',
    fields: [
      ['title', 'Title', 'text', true],
      ['abstract', 'Abstract', 'textarea'],
      ['authors', 'Authors', 'array'],
      ['supervisor', 'Supervisor'],
      ['department', 'Department'],
      ['level_id', 'Level ID'],
      ['session_id', 'Session ID'],
      ['keywords', 'Keywords', 'array'],
      ['document_id', 'Document ID'],
      ['visibility', 'Visibility']
    ],
    required: ['title', 'slug', 'authors', 'keywords', 'visibility']
  },
  events: {
    title: 'Events',
    description: 'Manage institutional events and their archive metadata.',
    fields: [
      ['title', 'Title', 'text', true],
      ['description', 'Description', 'textarea'],
      ['event_date', 'Date', 'date'],
      ['start_time', 'Start time', 'time'],
      ['end_time', 'End time', 'time'],
      ['venue', 'Venue'],
      ['cover_image_path', 'Cover image path'],
      ['status', 'Status', 'text', true],
      ['event_category', 'Category']
    ],
    required: ['title', 'status']
  },
  media: {
    title: 'Media',
    description: 'Manage photos, videos, flyers and event media metadata.',
    fields: [
      ['title', 'Title'],
      ['description', 'Description', 'textarea'],
      ['file_path', 'File path', 'text', true],
      ['category', 'Category'],
      ['year', 'Year', 'number'],
      ['event_id', 'Event ID'],
      ['media_type', 'Media type'],
      ['visibility', 'Visibility', 'text', true]
    ],
    required: ['file_path', 'visibility']
  },
  meetings: {
    title: 'Meetings',
    description: 'Manage executive, congress, emergency and committee meetings.',
    fields: [
      ['administration_id', 'Administration ID'],
      ['year', 'Year', 'number', true],
      ['meeting_type', 'Meeting type', 'text', true],
      ['title', 'Title', 'text', true],
      ['meeting_date', 'Date', 'date'],
      ['venue', 'Venue'],
      ['description', 'Description', 'textarea']
    ],
    required: ['year', 'meeting_type', 'title']
  },
  administrations: {
    title: 'Administrations',
    description: 'Manage the succession history of NAMS FUTA administrations.',
    fields: [
      ['name', 'Name', 'text', true],
      ['session_id', 'Session ID'],
      ['start_date', 'Start date', 'date'],
      ['end_date', 'End date', 'date'],
      ['is_current', 'Current', 'checkbox']
    ],
    required: ['name', 'is_current']
  },
  executives: {
    title: 'Executives',
    description: 'Manage executive council profiles and display order.',
    fields: [
      ['name', 'Name', 'text', true],
      ['position', 'Position', 'text', true],
      ['administration_id', 'Administration ID', 'text', true],
      ['photo_path', 'Photo path'],
      ['biography', 'Biography', 'textarea'],
      ['display_order', 'Display order', 'number', true]
    ],
    required: ['name', 'position', 'administration_id', 'display_order']
  },
  announcements: {
    title: 'Announcements',
    description: 'Manage scheduled public news and announcements.',
    fields: [
      ['title', 'Title', 'text', true],
      ['content', 'Content', 'textarea', true],
      ['cover_image_path', 'Cover image path'],
      ['priority', 'Priority', 'number', true],
      ['published', 'Published', 'checkbox'],
      ['publish_at', 'Publish at', 'datetime-local'],
      ['expires_at', 'Expires at', 'datetime-local'],
      ['category', 'Category']
    ],
    required: ['title', 'content', 'priority', 'published']
  },
  alumni: {
    title: 'Alumni',
    description: 'Maintain the alumni directory.',
    fields: [
      ['name', 'Full name', 'text', true],
      ['graduation_year', 'Graduation year', 'number'],
      ['session_id', 'Session ID'],
      ['profession', 'Profession'],
      ['organization', 'Organization'],
      ['bio', 'Biography', 'textarea'],
      ['photo_path', 'Photo path'],
      ['visibility', 'Visibility', 'text', true]
    ],
    required: ['name', 'visibility']
  },
  members: {
    title: 'Membership',
    description: 'Private membership records. Access remains controlled by RLS.',
    table: 'membership_records',
    fields: [
      ['full_name', 'Full name'],
      ['matric_number', 'Matric number'],
      ['membership_number', 'Membership number'],
      ['user_id', 'User ID'],
      ['session_id', 'Session ID'],
      ['level_id', 'Level ID'],
      ['email', 'Email'],
      ['phone', 'Phone'],
      ['status', 'Status', 'text', true],
      ['joined_at', 'Joined at', 'date']
    ],
    required: ['status']
  }
};

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

function emptyFor(cfg) {
  return Object.fromEntries((cfg.fields || []).map(([name, , type]) => [
    name,
    type === 'checkbox' ? false : ''
  ]));
}

function normalizeValue(value, type) {
  if (type === 'checkbox') return Boolean(value);
  if (type === 'number') return value === '' ? null : Number(value);
  if (type === 'array') {
    if (Array.isArray(value)) return value;
    return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  }
  return value === '' ? null : value;
}

export default function AdminModulePage({ module }) {
  const cfg = configs[module];
  const table = cfg?.table || module;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  async function load() {
    if (!supabase || !cfg) return;
    setLoading(true);
    setError('');
    const result = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(200);
    if (result.error) setError(result.error.message);
    else setRows(result.data || []);
    setLoading(false);
  }

  useEffect(() => {
    getCurrentProfile().then(({ profile: current }) => setProfile(current));
    load();
  }, [table]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(needle));
  }, [rows, query]);

  function edit(row) {
    setEditing(row);
    setForm(Object.fromEntries((cfg.fields || []).map(([name, , type]) => [
      name,
      type === 'array' ? (Array.isArray(row[name]) ? row[name].join(', ') : row[name] || '') : (row[name] ?? '')
    ])));
    setShow(true);
  }

  function create() {
    setEditing(null);
    setForm(emptyFor(cfg));
    setShow(true);
  }

  function change(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  const [form, setForm] = useState(() => cfg ? emptyFor(cfg) : {});

  async function writeActivity(action, resourceId, metadata = {}) {
    if (!supabase || !profile?.id) return;
    const result = await supabase.from('activity_logs').insert({
      user_id: profile.id,
      action,
      resource_type: table,
      resource_id: resourceId,
      metadata
    });
    if (result.error) console.warn('Activity log failed:', result.error.message);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {};
    for (const [name, , type] of cfg.fields) payload[name] = normalizeValue(form[name], type);

    if (module === 'projects') {
      payload.slug = editing?.slug || slugify(form.title);
      if (!payload.slug) {
        setError('A project title is required to generate its slug.');
        setSaving(false);
        return;
      }
    }

    const missing = (cfg.required || []).filter((name) => {
      const value = payload[name];
      return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
    });
    if (missing.length) {
      setError(`Please provide: ${missing.join(', ')}.`);
      setSaving(false);
      return;
    }

    const result = editing
      ? await supabase.from(table).update(payload).eq('id', editing.id).select().single()
      : await supabase.from(table).insert(payload).select().single();

    if (result.error) {
      setError(result.error.message);
    } else {
      await writeActivity(editing ? 'update' : 'create', result.data?.id, {
        title: form.title || form.name || form.full_name || null
      });
      setShow(false);
      await load();
    }
    setSaving(false);
  }

  async function remove(row) {
    if (!confirm(`Delete this ${cfg.title.toLowerCase()} record?`)) return;
    setError('');
    const result = await supabase.from(table).delete().eq('id', row.id);
    if (result.error) {
      setError(result.error.message);
    } else {
      await writeActivity('delete', row.id, {
        title: row.title || row.name || row.full_name || null
      });
      await load();
    }
  }

  if (!cfg) {
    return <main className="admin-shell"><div className="admin-empty"><p>This administration module is not configured yet.</p></div></main>;
  }

  return (
    <main className="admin-shell">
      <div className="admin-crud-head">
        <div>
          <p className="eyebrow">ADMIN MODULE</p>
          <h1>{cfg.title}</h1>
          <p>{cfg.description}</p>
        </div>
        <button className="admin-primary" onClick={create}><Plus size={17} /> New record</button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={16} />
          <input placeholder="Search records…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <span>{filtered.length} records</span>
      </div>

      {error && <div className="form-error admin-error">{error}</div>}

      {loading ? (
        <div className="admin-empty"><Loader2 size={18} className="spin" /> Loading…</div>
      ) : filtered.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {(cfg.fields || []).slice(0, 4).map(([name, label]) => <th key={name}>{label}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  {cfg.fields.slice(0, 4).map(([name]) => (
                    <td key={name}>
                      {typeof row[name] === 'boolean'
                        ? (row[name] ? 'Yes' : 'No')
                        : Array.isArray(row[name])
                          ? row[name].join(', ')
                          : String(row[name] ?? '—').slice(0, 90)}
                    </td>
                  ))}
                  <td>
                    <div className="admin-row-actions">
                      <button onClick={() => edit(row)} aria-label="Edit record"><Pencil size={15} /></button>
                      <button onClick={() => remove(row)} aria-label="Delete record"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty"><p>No records yet.</p></div>
      )}

      {show && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShow(false)}>
          <form className="admin-modal" onSubmit={save}>
            <div className="admin-modal-head">
              <div>
                <p className="eyebrow">{editing ? 'EDIT' : 'CREATE'}</p>
                <h2>{editing ? 'Update record' : 'New record'}</h2>
              </div>
              <button type="button" onClick={() => setShow(false)} aria-label="Close"><X /></button>
            </div>

            <div className="admin-form-grid">
              {cfg.fields.map(([name, label, type, required]) => (
                <label key={name} className={type === 'textarea' ? 'full' : ''}>
                  {label}{required ? ' *' : ''}
                  {type === 'textarea' ? (
                    <textarea name={name} rows="4" value={form[name] ?? ''} onChange={change} />
                  ) : type === 'checkbox' ? (
                    <input type="checkbox" name={name} checked={Boolean(form[name])} onChange={change} />
                  ) : type === 'array' ? (
                    <input type="text" name={name} value={form[name] ?? ''} onChange={change} placeholder="Separate values with commas" />
                  ) : (
                    <input type={type || 'text'} name={name} value={form[name] ?? ''} onChange={change} required={required} />
                  )}
                </label>
              ))}
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary" onClick={() => setShow(false)}>Cancel</button>
              <button className="admin-primary" disabled={saving}>
                {saving ? <><Loader2 size={16} className="spin" /> Saving…</> : <><Plus size={16} /> Save</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
