import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, KeyRound } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ADMIN_URL = 'https://darealnovaking.github.io/NAMS-FUTA/admin';
const RESET_URL = 'https://darealnovaking.github.io/NAMS-FUTA/admin/reset-password';

export default function AdminLogin({ onAuthenticated, forceRecovery = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState(forceRecovery ? 'recovery' : 'login');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    if (!supabase) { setError('The archive authentication service is not configured.'); setBusy(false); return; }

    if (mode === 'forgot') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_URL,
      });
      if (resetError) setError(resetError.message);
      else setNotice('If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.');
      setBusy(false);
      return;
    }

    if (mode === 'recovery') {
      if (password.length < 8) { setError('Choose a password with at least 8 characters.'); setBusy(false); return; }
      if (password !== confirmPassword) { setError('The passwords do not match.'); setBusy(false); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message); setBusy(false); return; }
      setNotice('Your password has been updated. Redirecting you to administrator sign-in…');
      setBusy(false);
      window.setTimeout(() => { window.location.href = ADMIN_URL; }, 900);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) { setError(authError.message); setBusy(false); return; }
    const { data: profile, error: profileError } = await supabase.from('profiles').select('id, username, full_name, role, is_active').eq('id', data.user.id).maybeSingle();
    if (profileError || !profile?.is_active || !['admin', 'super_admin'].includes(profile.role)) {
      await supabase.auth.signOut();
      setError('This account is not authorized to access the NAMS administration portal.');
      setBusy(false); return;
    }
    onAuthenticated(profile);
    setBusy(false);
  }

  const title = mode === 'forgot' ? 'Reset your password.' : mode === 'recovery' ? 'Choose a new password.' : 'Sign in to manage the archive.';
  const description = mode === 'forgot'
    ? 'Enter the email address associated with your administrator account. We will email you a secure reset link.'
    : mode === 'recovery'
      ? 'Create a new password for your NAMS FUTA administrator account.'
      : 'Authorized administrators can publish and maintain institutional records. Your access is protected by Supabase Auth and database policies.';

  return <main className="admin-login-page" aria-labelledby="admin-login-title"><div className="admin-login-card">
    <div className="admin-login-mark">{mode === 'forgot' ? <Mail size={21} /> : mode === 'recovery' ? <KeyRound size={21} /> : <LockKeyhole size={21} />}</div>
    <p className="eyebrow">NAMS FUTA · ARCHIVE ADMINISTRATION</p>
    <h1 id="admin-login-title">{title}</h1><p>{description}</p>
    <form onSubmit={submit}>
      {mode !== 'recovery' && <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>}
      {mode === 'login' && <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>}
      {mode === 'recovery' && <>
        <label>New password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></label>
        <label>Confirm new password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" /></label>
      </>}
      {error && <div className="form-error" role="alert">{error}</div>}
      {notice && <div className="form-success" role="status">{notice}</div>}
      <button className="button button-primary" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'forgot' ? 'Send reset link' : mode === 'recovery' ? 'Update password' : 'Sign in'}<ArrowRight size={17} /></button>
    </form>
    {mode === 'login' && <button className="back-home" type="button" onClick={() => { setMode('forgot'); setError(''); setNotice(''); }}>Forgot password?</button>}
    {mode === 'forgot' && <button className="back-home" type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Back to sign in</button>}
    {mode === 'recovery' && <p className="back-home">Use the secure link sent to your email to finish resetting your password.</p>}
    <a className="back-home" href="https://darealnovaking.github.io/NAMS-FUTA/">Return to archive</a>
  </div></main>;
}