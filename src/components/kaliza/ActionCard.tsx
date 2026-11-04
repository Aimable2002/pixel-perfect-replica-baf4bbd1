import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, TrendingUp, MessageSquare, CalendarCheck, Pencil, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolveAgentAction, type AgentAction } from '@/lib/api';
import { cn } from '@/lib/utils';

const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ActionCard({ action, onAdjust }: { action: AgentAction; onAdjust?: (text: string) => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(action.amount ?? 0);
  const [editing, setEditing] = useState(false);
  const pending = action.status === 'pending';
  const execute = async (yes: boolean) => {
    setBusy(true);
    try {
      await resolveAgentAction(action.id, yes, amount);
      await qc.invalidateQueries();
      toast.success(yes ? 'Applied in your workspace · live delivery not connected' : 'Declined — no changes made');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };
  const done = !pending && (
    <p className="mt-4 flex items-center gap-2 text-xs text-success"><Check className="size-4" />{action.status === 'approved' ? 'Applied in workspace' : 'Declined · no changes made'}</p>
  );

  if (action.kind === 'budget') {
    return (
      <article className="overflow-hidden rounded-xl border border-t-2 border-t-warning bg-card p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-warning">
          <TrendingUp className="size-4" />Budget Recommendation
          {pending && <span className="ml-auto rounded border border-warning/60 bg-warning/10 px-2 py-0.5 text-[10px]">Action required</span>}
        </div>
        <h3 className="mt-3 text-sm font-semibold">{action.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
        {pending ? <>
          {editing && <label className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">Daily budget ($)<Input type="number" min={1} max={10000} value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} className="w-24" /></label>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button size="sm" disabled={busy} className="bg-success text-success-foreground hover:bg-success/90" onClick={() => execute(true)}>Accept ${amount}</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => setEditing(v => !v)}>{editing ? 'Done' : 'Edit ($)'}</Button>
            <Button size="sm" variant="secondary" disabled={busy} className="text-destructive" onClick={() => execute(false)}>Decline</Button>
          </div>
        </> : done}
        <p className="mt-2 text-right text-[10px] text-muted-foreground">{stamp()}</p>
      </article>
    );
  }

  const isPost = action.kind === 'post';
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
        {isPost ? <Sparkles className="size-3.5" /> : <MessageSquare className="size-3.5" />}
        {isPost ? 'AI Content Generator' : 'Suggested reply'}<span className="font-normal normal-case text-muted-foreground">· Ready for review</span>
        <span className={cn('ml-auto rounded px-2 py-0.5 text-[10px] normal-case', pending ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground')}>{pending ? 'Pending' : action.status}</span>
      </div>
      <div className="p-3">
        {isPost && <p className="mb-3 px-1 text-sm">Here’s your draft. Ready when you are.</p>}
        <div className="overflow-hidden rounded-lg border bg-background">
          {action.image && <div className="relative"><img src={action.image} alt="Content draft" className="aspect-[16/10] w-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-cover/75 px-2.5 py-1 text-[10px] font-semibold text-cover-foreground">Instagram & FB Feed</span></div>}
          <div className="p-3">
            <h3 className="text-sm font-semibold">{isPost ? 'Slow mornings. Good company.' : action.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{action.body}</p>
            {isPost && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success"><CalendarCheck className="size-3.5" />Scheduled for Sat, 10:00 AM (after approval)</p>}
          </div>
        </div>
        {pending ? <div className="mt-3 space-y-2">
          <Button disabled={busy} className="w-full bg-gradient-primary text-primary-foreground" onClick={() => execute(true)}><Check className="size-4" />{isPost ? 'Approve & Publish Draft' : 'Send reply'}</Button>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Button variant="secondary" disabled={busy || !onAdjust} onClick={() => onAdjust?.(isPost ? 'Adjust the caption of my brunch draft' : `Rewrite the reply to ${action.title}`)}><Pencil className="size-4" />{isPost ? 'Ask Kaliza to adjust caption' : 'Ask Kaliza to rewrite'}</Button>
            <Button variant="secondary" disabled={busy} aria-label="Reject" onClick={() => execute(false)}><X className="size-4" /></Button>
          </div>
        </div> : done}
        <p className="mt-2 text-right text-[10px] text-muted-foreground">{stamp()}</p>
      </div>
    </article>
  );
}
