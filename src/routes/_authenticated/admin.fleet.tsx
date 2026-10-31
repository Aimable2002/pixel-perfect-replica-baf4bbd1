import {createFileRoute} from '@tanstack/react-router';
import {AdminConsole} from '@/components/kaliza/AdminConsole';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/admin/fleet')({head:()=>pageHead('Platform agent fleet','Kaliza platform administration: agent fleet and secure operations.'),component:()=> <AdminConsole view="Agent fleet"/>});
