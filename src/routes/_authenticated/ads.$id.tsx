import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pause, Pencil, Play } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/kaliza/AppShell";
import { CampaignDialog } from "@/components/kaliza/CampaignDialog";
import { CardSkeletons, EmptyState, KalizaMark, PageHeader, StatCard, StatusBadge, fmtDate, money } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getCampaign, getCampaignPerformance, updateCampaignStatus } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/ads/$id")({
  head: () => ({
    meta: [
      { title: "Campaign details — Kaliza" },
      { name: "description", content: "Performance and recommendations for a single Meta Ads campaign." },
      { property: "og:title", content: "Campaign details — Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Campaign performance and Kaliza's recommendations." },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const c = useQuery({ queryKey: ["campaign", id], queryFn: () => getCampaign(id) });
  const perf = useQuery({ queryKey: ["campaign-perf", id], queryFn: () => getCampaignPerformance(id) });
  const [editing, setEditing] = useState(false);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["campaign", id] }); qc.invalidateQueries({ queryKey: ["campaigns"] }); };

  return (
    <AppShell>
      <Link to="/ads" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All campaigns</Link>
      {c.isLoading ? <CardSkeletons count={1} className="h-64" /> : !c.data ? (
        <EmptyState title="Campaign not found" body="It may have been deleted." />
      ) : (
        <>
          <PageHeader title={c.data.name} description={`${c.data.objective} · started ${fmtDate(c.data.start)}`}
            actions={<>
              <StatusBadge status={c.data.status} />
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit</Button>
              <Button size="sm" onClick={async () => { if (!c.data) return; await updateCampaignStatus(id, c.data.status === "active" ? "paused" : "active"); refresh(); }}>
                {c.data.status === "active" ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Activate</>}
              </Button>
            </>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Spend" value={money(c.data.spend)} />
            <StatCard label="Impressions" value={c.data.impressions.toLocaleString()} />
            <StatCard label="CTR" value={c.data.impressions ? `${((c.data.clicks / c.data.impressions) * 100).toFixed(2)}%` : "—"} />
            <StatCard label="ROAS" value={c.data.roas ? `${c.data.roas}x` : "—"} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
              <h2 className="mb-4 font-semibold">Last 14 days</h2>
              {perf.isLoading ? <CardSkeletons count={1} className="h-64" /> : (
                <ChartContainer config={{ results: { label: "Results", color: "var(--chart-1)" }, spend: { label: "Spend", color: "var(--chart-2)" } }} className="h-64 w-full">
                  <AreaChart data={perf.data ?? []}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="results" stroke="var(--color-results)" fill="var(--color-results)" fillOpacity={0.15} />
                    <Area dataKey="spend" stroke="var(--color-spend)" fill="var(--color-spend)" fillOpacity={0.1} />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2"><KalizaMark className="size-6" /><h2 className="font-semibold">Kaliza recommends</h2></div>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="rounded-lg bg-accent p-3">Raise daily budget to {money(Math.round(c.data.budget * 1.25))} — frequency is low and CPA is stable.</li>
                <li className="rounded-lg bg-muted p-3">Swap creative #2 for your “Behind the kitchen” Reel (3.1x saves).</li>
                <li className="rounded-lg bg-muted p-3">Exclude people who booked in the last 30 days.</li>
              </ul>
            </div>
          </div>
          <CampaignDialog open={editing} campaign={c.data} onClose={() => setEditing(false)} onSaved={refresh} />
        </>
      )}
    </AppShell>
  );
}
