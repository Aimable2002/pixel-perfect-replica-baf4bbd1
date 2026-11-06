import { createFileRoute } from '@tanstack/react-router';
import { ApplicationWorkspace } from '@/components/kaliza/career/ApplicationWorkspace';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/applications/$id')({ head: () => pageHead('Career application workspace', 'Review application documents, instructions and approval before submission.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <ApplicationWorkspace id={Route.useParams().id}/>; }
