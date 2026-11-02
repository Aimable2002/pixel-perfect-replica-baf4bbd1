import { createFileRoute } from '@tanstack/react-router';
import { queryOptions } from '@tanstack/react-query';
import { getLegalDetails } from '@/lib/api';
import { pageHead } from '@/lib/page-head';
import { LegalPage } from '@/components/kaliza/LegalPage';
const options = queryOptions({ queryKey: ['legal-details'], queryFn: getLegalDetails });
export const Route = createFileRoute('/data-deletion')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => pageHead('Delete your data', 'Request deletion of Kaliza account or connected data, understand retention and track your request privately.'),
  component: () => <LegalPage kind="deletion" details={Route.useLoaderData()} />,
});