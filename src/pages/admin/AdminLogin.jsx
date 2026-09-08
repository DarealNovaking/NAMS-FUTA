import { useState } from 'react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    if (!supabase) { setError('The archive authentication service is not configured.'); setBusy(false); return; }
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) { setError(authError.message); setBusy(false); return; }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('id, username, full_name, role, is_active').eq('id', data.user.id).maybeSingle();
    if (profileError || !profile?.is_active || !['admin', 'super_admin'].includes(profile.role)) {
      await supabase.auth.signOut();
      setError('This account is not authorized to access the NAMS administration portal.');
      setBusy(false); return;
    }
    onAuthenticated(profile);
  }

  return <main className="admin-login-page"><div className="admin-login-card"><div className="admin-login-mark"><LockKeyhole size={21} /></div><p className="eyebrow">NAMS FUTA · ARCHIVE ADMINISTRATION</p><h1>Sign in to manage the archive.</h1><p>Authorized administrators can publish and maintain institutional records. Your access is protected by Supabase Auth and database policies.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button></form><a className="back-home" href="/">Return to archive</a></div></main>;
}
