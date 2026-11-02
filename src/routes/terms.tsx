import { createFileRoute } from '@tanstack/react-router';
import { queryOptions } from '@tanstack/react-query';
import { getLegalDetails } from '@/lib/api';
import { pageHead } from '@/lib/page-head';
import { LegalPage } from '@/components/kaliza/LegalPage';
const options = queryOptions({ queryKey: ['legal-details'], queryFn: getLegalDetails });
export const Route = createFileRoute('/terms')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => pageHead('Terms of Service', 'Kaliza account terms, owner approval safeguards, service availability and business responsibilities.'),
  component: () => <LegalPage kind="terms" details={Route.useLoaderData()} />,
});