import { createFileRoute } from '@tanstack/react-router';
import { CareerActivity } from '@/components/kaliza/career/CareerActivity';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/activity')({ head: () => pageHead('Career activity', 'Follow saved vacancies and application activity.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <CareerActivity/>; }
