import { createFileRoute } from '@tanstack/react-router';
import { JobDetails } from '@/components/kaliza/career/JobDetails';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/opportunities/$id')({ head: () => pageHead('Career vacancy details', 'Review employer information, requirements and career suitability.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <JobDetails id={Route.useParams().id}/>; }
