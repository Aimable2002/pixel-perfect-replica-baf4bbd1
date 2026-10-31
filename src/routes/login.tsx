import {createFileRoute} from '@tanstack/react-router';
import {AccountForm} from '@/components/kaliza/AccountForm';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/login')({head:()=>pageHead('Sign in','Sign in to your Kaliza business workspace.'),component:()=> <AccountForm/>});
