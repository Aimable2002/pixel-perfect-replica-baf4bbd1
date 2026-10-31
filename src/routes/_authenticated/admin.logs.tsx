import {createFileRoute} from '@tanstack/react-router';
import {AdminConsole} from '@/components/kaliza/AdminConsole';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/admin/logs')({head:()=>pageHead('Platform audit trail','Kaliza platform administration: audit trail and secure operations.'),component:()=> <AdminConsole view="Audit trail"/>});
