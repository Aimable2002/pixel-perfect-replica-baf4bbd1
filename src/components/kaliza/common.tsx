import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function KalizaMark({ className }: { className?: string }) {
  return (
    <div className={cn("grid size-8 place-items-center rounded-lg bg-gradient-primary shadow-elegant", className)}>
      <svg viewBox="0 0 24 24" className="size-[60%] text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
        <path d="M6 4v16M18 4l-8 8 8 8" />
        <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, change }: { label: string; value: string; change?: number }) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-card-foreground">{value}</p>
      {change !== undefined && (
        <p className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", up ? "text-success" : "text-destructive")}>
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(change)}% vs last period
        </p>
      )}
    </div>
  );
}

export function CardSkeletons({ count = 4, className = "h-28" }: { count?: number; className?: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("rounded-xl", className)} />
      ))}
    </>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center">
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">{icon ?? <Inbox className="size-5" />}</div>
      <p className="font-medium text-foreground">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}

const tone: Record<string, string> = {
  published: "bg-success/15 text-success", active: "bg-success/15 text-success", won: "bg-success/15 text-success", resolved: "bg-success/15 text-success",
  scheduled: "bg-primary/10 text-primary", contacted: "bg-primary/10 text-primary", open: "bg-primary/10 text-primary",
  pending: "bg-warning/20 text-warning-foreground", paused: "bg-warning/20 text-warning-foreground", new: "bg-warning/20 text-warning-foreground",
  hot: "bg-destructive/15 text-destructive", needs_owner: "bg-destructive/15 text-destructive",
  draft: "bg-muted text-muted-foreground", lost: "bg-muted text-muted-foreground",
};
const labels: Record<string, string> = { pending: "Awaiting approval", needs_owner: "Needs you" };

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", tone[status])}>
      {labels[status] ?? status}
    </Badge>
  );
}

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
export const money = (n: number) => `$${n.toLocaleString()}`;
