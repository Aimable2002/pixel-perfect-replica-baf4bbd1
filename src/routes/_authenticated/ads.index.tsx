import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/kaliza/AppShell";
import { CampaignDialog } from "@/components/kaliza/CampaignDialog";
import { CardSkeletons, EmptyState, PageHeader, StatCard, StatusBadge, money } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCampaigns, updateCampaignStatus } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/ads/")({
  head: () => ({
    meta: [
      { title: "Ads — Kaliza" },
      { name: "description", content: "Monitor and optimize your Meta Ads campaigns with Kaliza." },
      { property: "og:title", content: "Ads — Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Meta Ads campaigns, spend and ROAS in one view." },
    ],
  }),
  component: AdsPage,
});

function AdsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });
  const [creating, setCreating] = useState(false);
  const spend = (data ?? []).reduce((s, c) => s + c.spend, 0);
  const active = (data ?? []).filter((c) => c.status === "active");
  const avgRoas = active.length ? (active.reduce((s, c) => s + c.roas, 0) / active.length).toFixed(1) : "0";

  return (
    <AppShell>
      <PageHeader title="Ads" description="Kaliza watches every campaign and proposes changes — you stay in control."
        actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> New campaign</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? <CardSkeletons count={3} /> : <>
          <StatCard label="Spend this period" value={money(spend)} change={8.2} />
          <StatCard label="Active campaigns" value={String(active.length)} />
          <StatCard label="Avg. ROAS (active)" value={`${avgRoas}x`} change={-4.1} />
        </>}
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border bg-card shadow-card">
        {isLoading ? <div className="p-4"><CardSkeletons count={4} className="my-2 h-10" /></div> : !data?.length ? (
          <div className="p-6"><EmptyState title="No campaigns yet" body="Create one or ask Kaliza to build a campaign for your next offer." /></div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Budget/day</TableHead><TableHead className="text-right">Spend</TableHead><TableHead className="text-right">Clicks</TableHead><TableHead className="text-right">ROAS</TableHead><TableHead>On</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell><Link to="/ads/$id" params={{ id: c.id }} className="font-medium hover:text-primary">{c.name}</Link><p className="text-xs text-muted-foreground">{c.objective}</p></TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-right">{money(c.budget)}</TableCell>
                  <TableCell className="text-right">{money(c.spend)}</TableCell>
                  <TableCell className="text-right">{c.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{c.roas ? `${c.roas}x` : "—"}</TableCell>
                  <TableCell><Switch checked={c.status === "active"} aria-label="Toggle campaign" onCheckedChange={async (on) => { await updateCampaignStatus(c.id, on ? "active" : "paused"); qc.invalidateQueries({ queryKey: ["campaigns"] }); }} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <CampaignDialog open={creating} onClose={() => setCreating(false)} onSaved={() => qc.invalidateQueries({ queryKey: ["campaigns"] })} />
    </AppShell>
  );
}
