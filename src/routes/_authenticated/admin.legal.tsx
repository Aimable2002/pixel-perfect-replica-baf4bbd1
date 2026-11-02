import { createFileRoute } from '@tanstack/react-router';
import { pageHead } from '@/lib/page-head';
import { AdminConsole } from '@/components/kaliza/AdminConsole';
export const Route = createFileRoute('/_authenticated/admin/legal')({
  head: () => pageHead('Legal administration', 'Manage Kaliza business disclosures, legal details and private privacy requests.'),
  component: () => <AdminConsole view="Legal" />,
});