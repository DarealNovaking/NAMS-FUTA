import { useEffect, useState } from 'react';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import { supabase } from '../lib/supabase';
import { getCurrentProfile, isAdminProfile } from '../lib/auth';

export default function AdminPage() {
  const [profile, setProfile] = useState(undefined);
  useEffect(() => {
    let active = true;
    getCurrentProfile().then(({ profile: next }) => { if (active) setProfile(isAdminProfile(next) ? next : null); });
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session) setProfile(null);
      else getCurrentProfile().then(({ profile: next }) => setProfile(isAdminProfile(next) ? next : null));
    });
    return () => { active = false; subscription?.data?.subscription?.unsubscribe(); };
  }, []);
  if (profile === undefined) return <main className="admin-loading"><p>Checking administrator access…</p></main>;
  if (!profile) return <AdminLogin onAuthenticated={setProfile} />;
  return <AdminDashboard profile={profile} onSignOut={() => setProfile(null)} />;
}
