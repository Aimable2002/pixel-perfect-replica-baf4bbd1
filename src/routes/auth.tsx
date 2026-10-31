import {useEffect} from 'react';
import {createFileRoute,useNavigate} from '@tanstack/react-router';
import {AccountForm} from '@/components/kaliza/AccountForm';
import {getCurrentUser,watchAuth} from '@/lib/api';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/auth')({head:()=>pageHead('Account access','Secure access to your Kaliza workspace.'),component:Auth});
function Auth(){const nav=useNavigate();useEffect(()=>{const check=async()=>{if(await getCurrentUser())nav({to:'/onboarding'});};check();const sub=watchAuth(check);return()=>sub.unsubscribe();},[nav]);return <AccountForm/>;}
