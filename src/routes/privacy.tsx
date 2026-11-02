import { createFileRoute } from '@tanstack/react-router';
import { queryOptions } from '@tanstack/react-query';
import { getLegalDetails } from '@/lib/api';
import { pageHead } from '@/lib/page-head';
import { LegalPage } from '@/components/kaliza/LegalPage';
const options = queryOptions({ queryKey: ['legal-details'], queryFn: getLegalDetails });
export const Route = createFileRoute('/privacy')({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => pageHead('Privacy Policy', 'How Kaliza handles account information, workspace data, privacy rights and retention.'),
  component: () => <LegalPage kind="privacy" details={Route.useLoaderData()} />,
});