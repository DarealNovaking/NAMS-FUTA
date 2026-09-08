import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCurrentProfile } from '../../lib/auth';

const BUCKET = 'archive-documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/plain': '.txt',
};

const EMPTY = {
  title: '',
  description: '',
  category_id: '',
  level_id: '',
  course_id: '',
  session_id: '',
  semester_id: '',
  year: '',
  visibility: 'public',
  status: 'draft',
  license_type: '',
  rights_note: '',
  tags: '',
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function validateFile(selected) {
  if (!selected) return '';
  if (!ALLOWED_TYPES[selected.type]) {
    return 'Unsupported file type. Use PDF, Word, PowerPoint, Excel or plain text.';
  }
  if (selected.size > MAX_FILE_SIZE) {
    return `File is too large. Maximum size is 50 MB; this file is ${formatBytes(selected.size)}.`;
  }
  return '';
}

export default function AdminDocuments() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  async function load() {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const [documents, categoryResult, levelResult, courseResult, sessionResult, semesterResult, currentProfile] = await Promise.all([
      supabase
        .from('documents')
        .select('*, archive_categories:category_id(id,name,slug), levels:level_id(id,name), courses:course_id(id,code,title), sessions:session_id(id,name), semesters:semester_id(id,name)')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase.from('archive_categories').select('id,name,slug,parent_id,is_public,display_order').order('display_order').order('name'),
      supabase.from('levels').select('id,name,display_order').order('display_order'),
      supabase.from('courses').select('id,code,title,level_id').order('code'),
      supabase.from('sessions').select('id,name,start_year,end_year').order('start_year', { ascending: false }),
      supabase.from('semesters').select('id,name').order('name'),
      getCurrentProfile(),
    ]);

    const firstError = [documents, categoryResult, levelResult, courseResult, sessionResult, semesterResult]
      .map((result) => result.error)
      .find(Boolean);

    if (firstError) setError(firstError.message);
    else {
      setRows(documents.data || []);
      setCategories(categoryResult.data || []);
      setLevels(levelResult.data || []);
      setCourses(courseResult.data || []);
      setSessions(sessionResult.data || []);
      setSemesters(semesterResult.data || []);
      setProfile(currentProfile.profile || null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => [
      row.title,
      row.file_name,
      row.description,
      row.archive_categories?.name,
      row.courses?.code,
      row.courses?.title,
      row.levels?.name,
      row.sessions?.name,
      row.year,
      ...(row.tags || []),
    ].filter(Boolean).join(' ').toLowerCase().includes(needle));
  }, [rows, query]);

  const visibleCategories = categories.filter((category) => category.is_public !== false);
  const childCategories = categories.filter((category) => category.parent_id);
  const selectedLevel = form.level_id;
  const filteredCourses = courses.filter((course) => !selectedLevel || course.level_id === selectedLevel);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFile(null);
    setError('');
    setNotice('');
    setShow(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      title: row.title || '',
      description: row.description || '',
      category_id: row.category_id || '',
      level_id: row.level_id || '',
      course_id: row.course_id || '',
      session_id: row.session_id || '',
      semester_id: row.semester_id || '',
      year: row.year ?? '',
      visibility: row.visibility || 'public',
      status: row.status || 'draft',
      license_type: row.license_type || '',
      rights_note: row.rights_note || '',
      tags: Array.isArray(row.tags) ? row.tags.join(', ') : '',
    });
    setFile(null);
    setError('');
    setNotice('');
    setShow(true);
  }

  function closeModal() {
    if (saving) return;
    setShow(false);
    setFile(null);
  }

  function setField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === 'level_id' && current.course_id) {
        const course = courses.find((item) => item.id === current.course_id);
        if (course && course.level_id !== value) next.course_id = '';
      }
      return next;
    });
  }

  function handleFile(event) {
    const selected = event.target.files?.[0] || null;
    const validationError = validateFile(selected);
    setError(validationError);
    setFile(validationError ? null : selected);
  }

  async function logActivity(action, resourceId, metadata = {}) {
    if (!supabase || !profile?.id) return;
    const result = await supabase.from('activity_logs').insert({
      user_id: profile.id,
      action,
      resource_type: 'documents',
      resource_id: resourceId,
      metadata,
    });
    if (result.error) console.warn('Activity log failed:', result.error.message);
  }

  async function uploadFile(selectedFile) {
    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;
    const result = await supabase.storage.from(BUCKET).upload(path, selectedFile, {
      upsert: false,
      contentType: selectedFile.type,
      cacheControl: '3600',
    });
    if (result.error) throw result.error;
    return { path, name: selectedFile.name, type: selectedFile.type, size: selectedFile.size };
  }

  async function removeStorageFile(path) {
    if (!path) return null;
    const result = await supabase.storage.from(BUCKET).remove([path]);
    return result.error || null;
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!form.title.trim()) {
      setError('A document title is required.');
      return;
    }
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    let uploadedPath = null;

    try {
      const payload = {
        title: form.title.trim(),
        slug: `${slugify(form.title)}-${crypto.randomUUID().slice(0, 8)}`,
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        level_id: form.level_id || null,
        course_id: form.course_id || null,
        session_id: form.session_id || null,
        semester_id: form.semester_id || null,
        year: form.year ? Number(form.year) : null,
        visibility: form.visibility,
        status: form.status,
        license_type: form.license_type.trim() || null,
        rights_note: form.rights_note.trim() || null,
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      if (!editing && !file) {
        throw new Error('Attach the archive file before creating a document.');
      }

      let fileMeta = null;
      if (file) {
        fileMeta = await uploadFile(file);
        uploadedPath = fileMeta.path;
        payload.file_name = fileMeta.name;
        payload.file_path = fileMeta.path;
        payload.file_type = fileMeta.type;
        payload.file_size = fileMeta.size;
      }

      let result;
      if (editing) {
        result = await supabase.from('documents').update(payload).eq('id', editing.id).select().single();
      } else {
        payload.uploaded_by = profile?.id || null;
        result = await supabase.from('documents').insert(payload).select().single();
      }

      if (result.error) throw result.error;

      if (editing && file && editing.file_path && editing.file_path !== uploadedPath) {
        const oldFileError = await removeStorageFile(editing.file_path);
        if (oldFileError) {
          setNotice('Document updated, but the previous file could not be removed automatically. Review Storage for that old object.');
        }
      }

      await logActivity(editing ? 'update' : 'create', result.data.id, {
        title: payload.title,
        file_path: payload.file_path || editing?.file_path || null,
      });

      setShow(false);
      setFile(null);
      await load();
    } catch (err) {
      if (uploadedPath) await removeStorageFile(uploadedPath);
      setError(err?.message || 'Could not save document.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row) {
    const message = row.file_path
      ? `Delete “${row.title}” and its stored file? This cannot be undone.`
      : `Delete “${row.title}”? This cannot be undone.`;
    if (!window.confirm(message)) return;

    setError('');
    setNotice('');
    try {
      if (row.file_path) {
        const storageError = await removeStorageFile(row.file_path);
        if (storageError) throw new Error(`The document file could not be removed, so the database record was kept: ${storageError.message}`);
      }

      const result = await supabase.from('documents').delete().eq('id', row.id);
      if (result.error) throw result.error;
      await logActivity('delete', row.id, { title: row.title, file_path: row.file_path || null });
      await load();
    } catch (err) {
      setError(err?.message || 'Could not delete document.');
    }
  }

  async function changeStatus(row, status) {
    setError('');
    const result = await supabase.from('documents').update({ status }).eq('id', row.id);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await logActivity(status === 'published' ? 'publish' : 'archive', row.id, { title: row.title, status });
    await load();
  }

  async function openFile(row) {
    if (!row.file_path) return;
    setError('');

    const result = await supabase.storage.from(BUCKET).createSignedUrl(row.file_path, 300, { download: false });
    if (result.error) {
      setError(result.error.message);
      return;
    }
    window.open(result.data.signedUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <main className="admin-shell">
      <div className="admin-crud-head">
        <div>
          <p className="eyebrow">DOCUMENT MANAGER</p>
          <h1>Archive documents</h1>
          <p>Securely upload, classify, publish, replace and maintain institutional files.</p>
        </div>
        <button className="admin-primary" onClick={openCreate}><Plus size={17} /> New document</button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category, course, session…" /></label>
        <span>{filtered.length} records</span>
      </div>

      {error && <div className="form-error admin-error">{error}</div>}
      {notice && <div className="admin-notice">{notice}</div>}

      {loading ? (
        <div className="admin-empty"><Loader2 size={18} className="spin" /> Loading documents…</div>
      ) : filtered.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Document</th><th>Classification</th><th>Visibility</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.title}</strong><small>{row.file_name || 'No file attached'}</small></td>
                  <td>
                    <span>{row.archive_categories?.name || 'Unclassified'}</span>
                    <small>{[row.levels?.name, row.courses?.code, row.sessions?.name, row.year].filter(Boolean).join(' · ') || 'No academic metadata'}</small>
                  </td>
                  <td>{row.visibility || '—'}</td>
                  <td><span className={`status-pill status-${row.status}`}>{row.status || 'draft'}</span></td>
                  <td>
                    <div className="admin-row-actions">
                      {row.file_path && <button title="Open file" onClick={() => openFile(row)}><FileText size={15} /></button>}
                      <button title="Edit" onClick={() => openEdit(row)}><Pencil size={15} /></button>
                      {row.status !== 'published' && <button title="Publish" onClick={() => changeStatus(row, 'published')}><Check size={15} /></button>}
                      {row.status === 'published' && <button title="Archive" onClick={() => changeStatus(row, 'archived')}><X size={15} /></button>}
                      <button title="Delete" onClick={() => remove(row)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty"><FileText size={20} /><p>No documents match this search.</p></div>
      )}

      {show && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <form className="admin-modal" onSubmit={save}>
            <div className="admin-modal-head">
              <div><p className="eyebrow">{editing ? 'EDIT RECORD' : 'NEW RECORD'}</p><h2>{editing ? 'Update document' : 'Add document'}</h2></div>
              <button type="button" onClick={closeModal}><X /></button>
            </div>

            <div className="admin-form-grid">
              <label>Title<input name="title" value={form.title} onChange={setField} required /></label>
              <label>Category
                <select name="category_id" value={form.category_id} onChange={setField}>
                  <option value="">Select category</option>
                  {visibleCategories.filter((category) => !category.parent_id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  {childCategories.map((category) => <option key={category.id} value={category.id}>↳ {category.name}</option>)}
                </select>
              </label>
              <label>Level<select name="level_id" value={form.level_id} onChange={setField}><option value="">Any level</option>{levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</select></label>
              <label>Course code<select name="course_id" value={form.course_id} onChange={setField}><option value="">Any course</option>{filteredCourses.map((course) => <option key={course.id} value={course.id}>{course.code} — {course.title}</option>)}</select></label>
              <label>Session<select name="session_id" value={form.session_id} onChange={setField}><option value="">Any session</option>{sessions.map((session) => <option key={session.id} value={session.id}>{session.name}</option>)}</select></label>
              <label>Semester<select name="semester_id" value={form.semester_id} onChange={setField}><option value="">Any semester</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select></label>
              <label>Year<input name="year" type="number" min="2000" max="2100" value={form.year} onChange={setField} placeholder="e.g. 2026" /></label>
              <label>License type<input name="license_type" value={form.license_type} onChange={setField} placeholder="NAMS-owned / Public domain / …" /></label>
              <label>Visibility<select name="visibility" value={form.visibility} onChange={setField}><option value="public">Public</option><option value="student">Student</option><option value="admin">Admin</option></select></label>
              <label>Status<select name="status" value={form.status} onChange={setField}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              <label className="full">Tags<input name="tags" value={form.tags} onChange={setField} placeholder="constitution, policy, 2026" /></label>
              <label className="full">Description<textarea name="description" rows="4" value={form.description} onChange={setField} /></label>
              <label className="full">Rights note<textarea name="rights_note" rows="3" value={form.rights_note} onChange={setField} placeholder="Copyright/licensing notes or permitted-use conditions" /></label>
              <label className="full file-input">
                <Upload size={16} />
                <span>{file ? `${file.name} · ${formatBytes(file.size)}` : (editing?.file_name ? `Replace: ${editing.file_name}` : 'Attach PDF, Word, PowerPoint, Excel or text file')}</span>
                <input type="file" accept={Object.values(ALLOWED_TYPES).join(',')} onChange={handleFile} />
              </label>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary" onClick={closeModal}>Cancel</button>
              <button className="admin-primary" disabled={saving}>{saving ? <><Loader2 size={16} className="spin" /> Saving…</> : <><Upload size={16} /> {editing ? 'Update document' : 'Save document'}</>}</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
