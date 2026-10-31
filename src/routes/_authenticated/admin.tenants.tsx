import {createFileRoute} from '@tanstack/react-router';
import {AdminConsole} from '@/components/kaliza/AdminConsole';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/admin/tenants')({head:()=>pageHead('Platform tenants','Kaliza platform administration: tenants and secure operations.'),component:()=> <AdminConsole view="Tenants"/>});
