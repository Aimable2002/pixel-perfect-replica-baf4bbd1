import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, ExternalLink } from 'lucide-react';
import { getLegalDetails, saveLegalDetails, getAdminPrivacyRequests, reviewPrivacyRequest } from '@/lib/api';
import { legalFields, legalReady, parseLegalDetails, requestKinds, type LegalDetails } from '@/lib/legal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function DetailsForm({ initial }: { initial: LegalDetails }) {
  const qc = useQueryClient();
  const [details, setDetails] = useState(initial);
  const [busy, setBusy] = useState(false);
  const groups = [...new Set(legalFields.map(([group]) => group))];
  return <form onSubmit={async e => { e.preventDefault(); setBusy(true); try { const saved = await saveLegalDetails(details); setDetails(saved); await qc.invalidateQueries({ queryKey: ['legal-details'] }); toast.success('Legal details saved across all legal pages'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save legal details'); } finally { setBusy(false); } }}><div className="mb-7 flex flex-wrap gap-4 text-sm text-primary"><Link to="/privacy">Privacy <ExternalLink className="inline size-3" /></Link><Link to="/terms">Terms <ExternalLink className="inline size-3" /></Link><Link to="/data-deletion">Data deletion <ExternalLink className="inline size-3" /></Link></div><p className="mb-6 text-sm text-muted-foreground">{legalReady(details) ? 'Business details completed and review recorded.' : 'Draft · Complete the business details and obtain legal review before public launch.'}</p>{groups.map(group => <section key={group} className="mb-8 border-t pt-6"><h2 className="mb-5 text-lg font-semibold">{group}</h2><div className="grid gap-5 md:grid-cols-2">{legalFields.filter(([g]) => g === group).map(([, key, label]) => <div key={key} className="min-w-0"><Label htmlFor={key}>{label}</Label>{['transferAuthorization', 'securityMeasures', 'cookiePolicy', 'trainingPolicy', 'refundPolicy', 'liabilityCap'].includes(key) ? <Textarea id={key} className="mt-2" value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value, reviewed: false })} maxLength={4000} placeholder="Not yet provided" /> : <Input id={key} className="mt-2" type={key.endsWith('Email') ? 'email' : key === 'effectiveDate' ? 'date' : key === 'productionDomain' ? 'url' : 'text'} value={details[key]} onChange={e => setDetails({ ...details, [key]: e.target.value, reviewed: false })} maxLength={4000} placeholder="Not yet provided" />}</div>)}</div></section>)}<div className="flex items-start gap-3 border-t py-6"><Checkbox id="legal-reviewed" checked={details.reviewed} onCheckedChange={checked => setDetails({ ...details, reviewed: checked === true })} /><Label htmlFor="legal-reviewed" className="text-sm leading-6">I have verified these disclosures and obtained the necessary legal review. This does not activate providers or certify Meta approval.</Label></div><Button disabled={busy}><Save className="size-4" />{busy ? 'Saving…' : 'Save legal details'}</Button></form>;
}

type RequestRow = Awaited<ReturnType<typeof getAdminPrivacyRequests>>[number];
function ReviewRow({ request }: { request: RequestRow }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState(request.status);
  const [response, setResponse] = useState(request.response);
  const [busy, setBusy] = useState(false);
  return <article className="border-t py-6"><h3 className="font-semibold">{requestKinds.find(([kind]) => kind === request.kind)?.[1]}</h3><p className="mt-2 break-all text-xs text-muted-foreground">Reference {request.id} · Account {request.owner_id}</p><p className="mt-2 text-xs text-muted-foreground">Submitted {new Date(request.created_at).toLocaleString()}</p>{request.note && <p className="my-4 whitespace-pre-line break-words text-sm">{request.note}</p>}<form className="mt-4 max-w-2xl space-y-4" onSubmit={async e => { e.preventDefault(); setBusy(true); try { await reviewPrivacyRequest({ id: request.id, status, response }); await qc.invalidateQueries({ queryKey: ['admin-privacy-requests'] }); toast.success('Review saved. No deletion or email was triggered.'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save review'); } finally { setBusy(false); } }}><div><Label htmlFor={`status-${request.id}`}>Review status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger id={`status-${request.id}`} className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="requested">Requested</SelectItem><SelectItem value="in_review">In review</SelectItem><SelectItem value="action_required">Action required</SelectItem></SelectContent></Select></div><div><Label htmlFor={`response-${request.id}`}>Response visible to the account owner</Label><Textarea id={`response-${request.id}`} className="mt-2" maxLength={4000} value={response} onChange={e => setResponse(e.target.value)} /></div><Button variant="outline" disabled={busy}><Save className="size-4" />Save review</Button></form></article>;
}
export function AdminLegalPanel({ preview }: { preview: boolean }) {
  const { data, error } = useQuery({ queryKey: ['legal-details'], queryFn: getLegalDetails });
  const { data: requests, error: requestError } = useQuery({ queryKey: ['admin-privacy-requests'], queryFn: getAdminPrivacyRequests, enabled: !preview });
  if (preview) return <p className="border-y py-8 text-sm text-muted-foreground">Legal settings and privacy requests require a signed-in administrator. No sample edits are saved.</p>;
  return <div>{error && <p role="alert" className="text-destructive">Could not load legal details.</p>}{data ? <DetailsForm initial={parseLegalDetails(data)} /> : !error && <p>Loading legal details…</p>}<section className="mt-12"><h2 className="text-2xl font-semibold">Privacy request queue</h2><p className="my-4 text-sm text-muted-foreground">Manual review only. Provider erasure, account deletion and completion emails are not automated.</p>{requestError && <p role="alert" className="text-destructive">Could not load requests.</p>}{requests?.length === 0 && <p className="text-sm text-muted-foreground">No privacy requests yet.</p>}{requests?.map(request => <ReviewRow key={request.id} request={request} />)}</section></div>;
}