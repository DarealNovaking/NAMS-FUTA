import { useEffect, useMemo, useState } from 'react';
import { Check, FileText, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EMPTY = { title:'', description:'', category:'', subcategory:'', level:'', course:'', session:'', semester:'', year:'', visibility:'public', status:'draft', license_type:'', rights_note:'' };
const BUCKET = 'archive-documents';

export default function AdminDocuments() {
  const [rows,setRows]=useState([]), [loading,setLoading]=useState(true), [error,setError]=useState('');
  const [query,setQuery]=useState(''), [show,setShow]=useState(false), [editing,setEditing]=useState(null);
  const [form,setForm]=useState(EMPTY), [file,setFile]=useState(null), [saving,setSaving]=useState(false);

  async function load(){
    if(!supabase){setError('Supabase is not configured.');setLoading(false);return;}
    setLoading(true); const result=await supabase.from('documents').select('*').order('created_at',{ascending:false}).limit(200);
    if(result.error)setError(result.error.message); else {setError('');setRows(result.data||[]);} setLoading(false);
  }
  useEffect(()=>{load();},[]);
  const filtered=useMemo(()=>rows.filter(r=>[r.title,r.file_name,r.category,r.course,r.session,r.year].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())),[rows,query]);
  function openCreate(){setEditing(null);setForm(EMPTY);setFile(null);setShow(true);}
  function openEdit(row){setEditing(row);setForm(Object.fromEntries(Object.keys(EMPTY).map(k=>[k,row[k]??''])));setFile(null);setShow(true);}
  function setField(e){setForm(f=>({...f,[e.target.name]:e.target.value}));}

  async function save(e){
    e.preventDefault(); if(!form.title.trim()){setError('A document title is required.');return;}
    setSaving(true);setError('');
    try{
      let fileMeta={};
      if(file){
        const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
        const path=`${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;
        const upload=await supabase.storage.from(BUCKET).upload(path,file,{upsert:false,contentType:file.type||undefined});
        if(upload.error)throw upload.error;
        fileMeta={file_name:file.name,file_path:path,file_type:file.type||null,file_size:file.size};
      }
      const payload={...form,...fileMeta};
      Object.keys(payload).forEach(k=>{if(payload[k]==='')payload[k]=null;});
      let result;
      if(editing) result=await supabase.from('documents').update(payload).eq('id',editing.id).select().single();
      else result=await supabase.from('documents').insert(payload).select().single();
      if(result.error)throw result.error;
      await supabase.from('activity_logs').insert({action:editing?'update':'create',entity_type:'documents',entity_id:result.data?.id,metadata:{title:form.title}});
      setShow(false);await load();
    }catch(err){setError(err.message||'Could not save document.');}
    finally{setSaving(false);}
  }
  async function remove(row){
    if(!window.confirm(`Delete “${row.title}”? This removes the database record. Storage cleanup may require manual review.`))return;
    setError(''); const result=await supabase.from('documents').delete().eq('id',row.id);
    if(result.error){setError(result.error.message);return;} await supabase.from('activity_logs').insert({action:'delete',entity_type:'documents',entity_id:row.id,metadata:{title:row.title}}); await load();
  }
  async function publish(row,status){const result=await supabase.from('documents').update({status}).eq('id',row.id);if(result.error)setError(result.error.message);else await load();}
  async function openFile(row){
    if(!row.file_path)return;
    const result=await supabase.storage.from(BUCKET).createSignedUrl(row.file_path,300);
    if(result.error)setError(result.error.message); else window.open(result.data.signedUrl,'_blank','noopener,noreferrer');
  }

  return <main className="admin-shell"><div className="admin-crud-head"><div><p className="eyebrow">DOCUMENT MANAGER</p><h1>Archive documents</h1><p>Create, review, publish and maintain institutional files.</p></div><button className="admin-primary" onClick={openCreate}><Plus size={17}/> New document</button></div>
    <div className="admin-toolbar"><label className="admin-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, course, session…"/></label><span>{filtered.length} records</span></div>
    {error&&<div className="form-error admin-error">{error}</div>}
    {loading?<div className="admin-empty"><Loader2 size={18} className="spin"/> Loading documents…</div>:filtered.length?<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Document</th><th>Classification</th><th>Visibility</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(row=><tr key={row.id}><td><strong>{row.title}</strong><small>{row.file_name||'No file attached'}</small></td><td><span>{row.category||'—'}</span><small>{[row.level,row.course,row.session].filter(Boolean).join(' · ')}</small></td><td>{row.visibility||'—'}</td><td><span className={`status-pill status-${row.status}`}>{row.status||'draft'}</span></td><td><div className="admin-row-actions">{row.file_path&&<button title="Open file" onClick={()=>openFile(row)}><FileText size={15}/></button>}<button title="Edit" onClick={()=>openEdit(row)}><Pencil size={15}/></button>{row.status!=='published'&&<button title="Publish" onClick={()=>publish(row,'published')}><Check size={15}/></button>}{row.status==='published'&&<button title="Archive" onClick={()=>publish(row,'archived')}><X size={15}/></button>}<button title="Delete" onClick={()=>remove(row)}><Trash2 size={15}/></button>}</div></td></tr>)}</tbody></table></div>:<div className="admin-empty"><FileText size={20}/><p>No documents match this search.</p></div>}
    {show&&<div className="admin-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setShow(false)}><form className="admin-modal" onSubmit={save}><div className="admin-modal-head"><div><p className="eyebrow">{editing?'EDIT RECORD':'NEW RECORD'}</p><h2>{editing?'Update document':'Add document'}</h2></div><button type="button" onClick={()=>setShow(false)}><X/></button></div><div className="admin-form-grid">{[['title','Title'],['category','Category'],['subcategory','Subcategory'],['level','Level'],['course','Course code'],['session','Session'],['semester','Semester'],['year','Year'],['license_type','License type']].map(([name,label])=><label key={name}>{label}<input name={name} value={form[name]} onChange={setField}/></label>)}<label>Visibility<select name="visibility" value={form.visibility} onChange={setField}><option>public</option><option>student</option><option>admin</option><option>restricted</option></select></label><label>Status<select name="status" value={form.status} onChange={setField}><option>draft</option><option>published</option><option>archived</option></select></label><label className="full">Description<textarea name="description" rows="4" value={form.description} onChange={setField}/></label><label className="full">Rights note<textarea name="rights_note" rows="3" value={form.rights_note} onChange={setField}/></label><label className="full file-input"><Upload size={16}/><span>{file?file.name:(editing?.file_name||'Attach PDF, Word, PowerPoint, Excel or text file')}</span><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={e=>setFile(e.target.files?.[0]||null)}/></label></div><div className="admin-modal-actions"><button type="button" className="admin-secondary" onClick={()=>setShow(false)}>Cancel</button><button className="admin-primary" disabled={saving}>{saving?<><Loader2 size={16} className="spin"/> Saving…</>:<><Upload size={16}/> Save document</>}</button></div></form></div>}
  </main>;
}
