import { createFileRoute } from '@tanstack/react-router';
import { CareerProfileForm } from '@/components/kaliza/career/CareerProfileForm';
import { careerQueries } from '@/components/kaliza/career/shared';
import { pageHead } from '@/lib/page-head';
export const Route = createFileRoute('/_authenticated/career/profile')({ head: () => pageHead('Career profile', 'Manage qualifications, CV documents and Rwanda-first job preferences.'), loader: async ({context}) => { await Promise.all([context.queryClient.ensureQueryData(careerQueries.profile),context.queryClient.ensureQueryData(careerQueries.jobs),context.queryClient.ensureQueryData(careerQueries.applications),context.queryClient.ensureQueryData(careerQueries.activity)]); }, component: Page });
function Page() { return <CareerProfileForm/>; }
