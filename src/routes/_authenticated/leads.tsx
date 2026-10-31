import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, EmptyState, PageHeader, StatCard, StatusBadge, fmtTime, money } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLeads, updateLeadStatus, type LeadStatus } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Kaliza" },
      { name: "description", content: "Qualified conversations and opportunities found by Kaliza across Instagram and Facebook." },
      { property: "og:title", content: "Leads — Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Track qualified leads and deals." },
    ],
  }),
  component: LeadsPage,
});

const statuses: LeadStatus[] = ["new", "contacted", "hot", "won", "lost"];

function LeadsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["leads"], queryFn: getLeads });
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const list = (data ?? []).filter((l) => filter === "all" || l.status === filter);
  const open = (data ?? []).filter((l) => !["won", "lost"].includes(l.status));

  return (
    <AppShell>
      <PageHeader title="Leads" description="Conversations Kaliza qualified as real opportunities." />
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? <CardSkeletons count={3} /> : <>
          <StatCard label="Open pipeline" value={money(open.reduce((s, l) => s + l.value, 0))} />
          <StatCard label="Hot leads" value={String((data ?? []).filter((l) => l.status === "hot").length)} />
          <StatCard label="Won this month" value={money((data ?? []).filter((l) => l.status === "won").reduce((s, l) => s + l.value, 0))} change={18} />
        </>}
      </div>
      <div className="mt-6 mb-4 flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((s) => <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} className="capitalize" onClick={() => setFilter(s)}>{s}</Button>)}
      </div>
      <div className="space-y-3">
        {isLoading ? <CardSkeletons count={4} className="h-20" /> : list.length === 0 ? <EmptyState title="No leads in this stage" /> : list.map((l) => (
          <div key={l.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-medium">{l.name}</p><StatusBadge status={l.status} /></div>
              <p className="mt-0.5 text-sm text-muted-foreground">{l.interest}</p>
              <p className="mt-1 text-xs text-muted-foreground">{l.source} · last contact {fmtTime(l.lastContact)}</p>
            </div>
            <p className="font-display text-lg font-semibold">{money(l.value)}</p>
            <Select value={l.status} onValueChange={async (v) => { await updateLeadStatus(l.id, v as LeadStatus); qc.invalidateQueries({ queryKey: ["leads"] }); toast.success(`${l.name} → ${v}`); }}>
              <SelectTrigger className="w-36 capitalize"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
