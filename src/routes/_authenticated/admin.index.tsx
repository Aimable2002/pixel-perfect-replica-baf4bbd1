import {createFileRoute} from '@tanstack/react-router';
import {AdminConsole} from '@/components/kaliza/AdminConsole';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/admin/')({head:()=>pageHead('Platform overview','Kaliza platform administration: overview and secure operations.'),component:()=> <AdminConsole view="Overview"/>});
