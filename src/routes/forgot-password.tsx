import {useState} from 'react';
import {createFileRoute,Link} from '@tanstack/react-router';
import {AuthLayout} from '@/components/kaliza/AuthLayout';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {requestPasswordReset} from '@/lib/api';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/forgot-password')({head:()=>pageHead('Forgot password','Request a secure password recovery link for your Kaliza account.'),component:Forgot});
function Forgot(){const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);return <AuthLayout title="Let’s get you back in." subtitle="We’ll send a secure recovery link."><form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await requestPasswordReset(String(new FormData(e.currentTarget).get('email')));setMessage('Check your email for your password reset link.');}catch(e){setMessage(e instanceof Error?e.message:'Could not send recovery email');}finally{setBusy(false);}}}><Input name="email" type="email" aria-label="Email" placeholder="you@company.com" required/><Button disabled={busy} className="w-full">Send recovery link</Button>{message&&<p role="status" className="text-sm text-muted-foreground">{message}</p>}<Link to="/login" className="block text-center text-xs text-primary">Back to sign in</Link></form></AuthLayout>;}
