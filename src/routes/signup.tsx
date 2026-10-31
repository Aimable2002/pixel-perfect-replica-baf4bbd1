import {createFileRoute} from '@tanstack/react-router';
import {AccountForm} from '@/components/kaliza/AccountForm';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/signup')({head:()=>pageHead('Create account','Create your Kaliza account and meet your autonomous brand operator.'),component:()=> <AccountForm register/>});
