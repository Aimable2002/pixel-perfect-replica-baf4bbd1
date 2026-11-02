import { createFileRoute, Link } from '@tanstack/react-router';
import { pageHead } from '@/lib/page-head';
import { PublicShell } from '@/components/kaliza/PublicShell';
import { PrivacyRequests } from '@/components/kaliza/PrivacyRequests';
export const Route = createFileRoute('/data-deletion_/status')({
  head: () => ({ ...pageHead('Privacy request status', 'Submit a verified privacy request and view your private Kaliza request history.'), meta: [...pageHead('Privacy request status', 'Submit a verified privacy request and view your private Kaliza request history.').meta, { name: 'robots', content: 'noindex' }] }),
  component: StatusPage,
});
function StatusPage() { return <PublicShell><main className="mx-auto max-w-4xl px-6 py-12"><p className="hud-label">Kaliza · Your privacy</p><h1 className="mt-4 text-3xl font-semibold">Privacy requests</h1><p className="my-5 text-sm text-muted-foreground">Only you and authorized administrators can see your account requests.</p><Link to="/data-deletion" className="mb-8 inline-block text-sm text-primary">Read data-deletion information</Link><PrivacyRequests /></main></PublicShell>; }