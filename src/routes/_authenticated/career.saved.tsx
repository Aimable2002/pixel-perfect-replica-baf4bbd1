import { createFileRoute } from '@tanstack/react-router';
import { CareerOpportunities } from '@/components/kaliza/career/CareerOpportunities';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/saved')({ head: () => pageHead('Saved career opportunities', 'Revisit your saved career opportunities.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <CareerOpportunities savedOnly/>; }
