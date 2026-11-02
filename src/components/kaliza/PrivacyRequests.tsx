import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCurrentUser, getMyPrivacyRequests, submitPrivacyRequest } from '@/lib/api';
import { requestKinds } from '@/lib/legal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PrivacyRequests() {
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ['current-user'], queryFn: getCurrentUser });
  const { data: requests, error } = useQuery({ queryKey: ['my-privacy-requests'], queryFn: getMyPrivacyRequests, enabled: !!user });
  const [kind, setKind] = useState('delete_account');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  if (isLoading) return <p>Checking account…</p>;
  if (!user) return <div className="border-y py-8"><h2 className="text-xl font-semibold">Verify your account</h2><p className="mt-3 text-sm text-muted-foreground">Sign in to submit an account request and see your private status history.</p><Button asChild className="mt-5"><Link to="/login">Sign in</Link></Button></div>;
  return <div><form className="max-w-xl space-y-5 border-b pb-8" onSubmit={async e => { e.preventDefault(); setBusy(true); try { const request = await submitPrivacyRequest({ kind, note }); toast.success(`Request saved · ${request.id}`); setNote(''); await qc.invalidateQueries({ queryKey: ['my-privacy-requests'] }); } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save request'); } finally { setBusy(false); } }}><div><Label htmlFor="privacy-kind">Request type</Label><Select value={kind} onValueChange={setKind}><SelectTrigger id="privacy-kind" className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{requestKinds.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="privacy-note">Additional details (optional)</Label><Textarea id="privacy-note" className="mt-2" maxLength={2000} value={note} onChange={e => setNote(e.target.value)} /></div><p className="text-xs leading-6 text-muted-foreground">Requests are manually reviewed. Your account stays active until the request is processed. Never include passwords or access tokens.</p><Button disabled={busy}>{busy ? 'Saving…' : 'Submit privacy request'}</Button></form><h2 className="mt-8 text-xl font-semibold">Your requests</h2>{error && <p role="alert" className="mt-4 text-destructive">Could not load your requests.</p>}{requests?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No requests submitted yet.</p>}<div className="mt-5 divide-y">{requests?.map(r => <article key={r.id} className="py-6"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-semibold">{requestKinds.find(([k]) => k === r.kind)?.[1]}</h3><span className="text-sm text-primary">{r.status === 'in_review' ? 'In review' : r.status === 'action_required' ? 'Action required' : 'Requested'}</span></div><p className="mt-3 break-all text-xs text-muted-foreground">Reference: {r.id}</p><p className="mt-2 text-xs text-muted-foreground">Submitted {new Date(r.created_at).toLocaleDateString()}</p>{r.note && <p className="mt-3 whitespace-pre-line break-words text-sm">{r.note}</p>}{r.response && <div className="mt-4 border-l-2 border-primary pl-4"><p className="text-xs text-muted-foreground">Administrator response</p><p className="mt-2 whitespace-pre-line break-words text-sm">{r.response}</p></div>}</article>)}</div></div>;
}