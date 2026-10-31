import {useEffect,useState} from 'react';
import {createFileRoute,Link} from '@tanstack/react-router';
import {AuthLayout} from '@/components/kaliza/AuthLayout';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {getCurrentUser,resetPassword} from '@/lib/api';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset password','Set a new password for your Kaliza account.'),component:Reset});
function Reset(){const [valid,setValid]=useState(false);const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);useEffect(()=>{const recovery=window.location.hash.includes('type=recovery');getCurrentUser().then(user=>setValid(!!user||recovery));},[]);return <AuthLayout title="A fresh start." subtitle="Choose a new password for your account.">{valid?<form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await resetPassword(String(new FormData(e.currentTarget).get('password')));setMessage('Password updated. You can now sign in.');}catch(e){setMessage(e instanceof Error?e.message:'Reset failed');}finally{setBusy(false);}}}><Input name="password" type="password" aria-label="New password" placeholder="New password" minLength={8} required/><Button className="w-full" disabled={busy}>Update password</Button>{message&&<p role="status" className="text-sm">{message}</p>}</form>:<p className="text-sm text-muted-foreground">Open your password recovery email to continue.</p>}<Link to="/login" className="mt-5 block text-xs text-primary">Back to sign in</Link></AuthLayout>;}
