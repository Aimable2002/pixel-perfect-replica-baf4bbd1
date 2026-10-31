import {createFileRoute} from '@tanstack/react-router';
import {AdminConsole} from '@/components/kaliza/AdminConsole';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/_authenticated/admin/integrations')({head:()=>pageHead('Platform integrations','Kaliza platform administration: integrations and secure operations.'),component:()=> <AdminConsole view="Integrations"/>});
