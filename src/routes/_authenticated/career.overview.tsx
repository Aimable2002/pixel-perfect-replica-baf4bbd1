import { createFileRoute } from '@tanstack/react-router';
import { CareerOverview } from '@/components/kaliza/career/CareerOverview';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/overview')({ head: () => pageHead('Career Growth overview', 'Your career profile, saved opportunities, applications and deadlines.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <CareerOverview/>; }
