import { useEffect,useState } from 'react';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminDocuments from './admin/AdminDocuments';
import AdminModulePage from './admin/AdminModulePage';
import AdminSettings from './admin/AdminSettings';
import AdminActivity from './admin/AdminActivity';
import AdminHandover from './admin/AdminHandover';
import AdminAdmins from './admin/AdminAdmins';
import { supabase } from '../lib/supabase';
import { getCurrentProfile,isAdminProfile } from '../lib/auth';
function Module({name}){if(name==='documents')return <AdminDocuments/>;if(name==='settings')return <AdminSettings/>;if(name==='activity')return <AdminActivity/>;if(name==='handover')return <AdminHandover/>;if(name==='admins')return <AdminAdmins/>;return <AdminModulePage module={name}/>}
export default function AdminPage(){const [profile,setProfile]=useState(undefined);useEffect(()=>{let active=true;getCurrentProfile().then(({profile:next})=>{if(active)setProfile(isAdminProfile(next)?next:null)});const subscription=supabase?.auth.onAuthStateChange((_event,session)=>{if(!session)setProfile(null);else getCurrentProfile().then(({profile:next})=>setProfile(isAdminProfile(next)?next:null))});return()=>{active=false;subscription?.data?.subscription?.unsubscribe()}},[]);if(profile===undefined)return <main className="admin-loading"><p>Checking administrator access…</p></main>;if(!profile)return <AdminLogin onAuthenticated={setProfile}/>;const basePath=(import.meta.env.BASE_URL||'/')==='/'?'':(import.meta.env.BASE_URL||'/').replace(/\\/$/,'');const pathname=basePath&&window.location.pathname.startsWith(basePath+'/')?window.location.pathname.slice(basePath.length):window.location.pathname;const path=pathname||'/';const module=path.startsWith('/admin/')?path.split('/')[2]:null;return !module||module==='login'?<AdminDashboard profile={profile} onSignOut={()=>setProfile(null)}/>:<Module name={module}/>}
