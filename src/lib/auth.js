import { supabase } from './supabase';

export async function getCurrentProfile() {
  if (!supabase) return { profile: null, error: new Error('Supabase is not configured.') };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { profile: null, error: userError ?? null };
  const { data, error } = await supabase.from('profiles').select('id, username, full_name, role, is_active').eq('id', user.id).maybeSingle();
  return { profile: data, error };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export function isAdminProfile(profile) {
  return Boolean(profile?.is_active && ['admin', 'super_admin'].includes(profile.role));
}
