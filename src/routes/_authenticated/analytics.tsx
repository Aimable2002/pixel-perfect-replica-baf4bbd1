import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, PageHeader, StatCard, money } from "@/components/kaliza/common";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getAnalytics, type AnalyticsPoint } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Kaliza" },
      { name: "description", content: "Engagement, reach, leads, ad spend and results over time." },
      { property: "og:title", content: "Analytics — Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Charts for reach, engagement, leads and ad results." },
    ],
  }),
  component: AnalyticsPage,
});

const sum = (d: AnalyticsPoint[] | undefined, k: keyof AnalyticsPoint) => (d ?? []).reduce((s, p) => s + Number(p[k]), 0);
const axis = { x: <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tickLine={false} axisLine={false} minTickGap={24} />, y: <YAxis tickLine={false} axisLine={false} width={40} /> };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-5 shadow-card"><h2 className="mb-4 font-semibold">{title}</h2>{children}</div>;
}

function AnalyticsPage() {
  const [range, setRange] = useState("30");
  const { data, isLoading } = useQuery({ queryKey: ["analytics", range], queryFn: () => getAnalytics(Number(range)) });

  return (
    <AppShell>
      <PageHeader title="Analytics" description="How your Meta presence is turning into business."
        actions={<ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v)} variant="outline">
          <ToggleGroupItem value="7">7d</ToggleGroupItem><ToggleGroupItem value="30">30d</ToggleGroupItem><ToggleGroupItem value="90">90d</ToggleGroupItem>
        </ToggleGroup>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {isLoading ? <CardSkeletons count={5} /> : <>
          <StatCard label="Reach" value={sum(data, "reach").toLocaleString()} />
          <StatCard label="Engagements" value={sum(data, "engagement").toLocaleString()} />
          <StatCard label="Leads" value={String(sum(data, "leads"))} />
          <StatCard label="Ad spend" value={money(sum(data, "spend"))} />
          <StatCard label="Ad results" value={sum(data, "results").toLocaleString()} />
        </>}
      </div>
      {isLoading ? <div className="mt-6 grid gap-6 lg:grid-cols-2"><CardSkeletons count={4} className="h-80" /></div> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Reach">
            <ChartContainer config={{ reach: { label: "Reach", color: "var(--chart-1)" } }} className="h-64 w-full">
              <AreaChart data={data ?? []}><CartesianGrid vertical={false} />{axis.x}{axis.y}<ChartTooltip content={<ChartTooltipContent />} /><Area dataKey="reach" stroke="var(--color-reach)" fill="var(--color-reach)" fillOpacity={0.15} /></AreaChart>
            </ChartContainer>
          </ChartCard>
          <ChartCard title="Engagement">
            <ChartContainer config={{ engagement: { label: "Engagements", color: "var(--chart-2)" } }} className="h-64 w-full">
              <LineChart data={data ?? []}><CartesianGrid vertical={false} />{axis.x}{axis.y}<ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2} dot={false} /></LineChart>
            </ChartContainer>
          </ChartCard>
          <ChartCard title="Leads">
            <ChartContainer config={{ leads: { label: "Leads", color: "var(--chart-3)" } }} className="h-64 w-full">
              <BarChart data={data ?? []}><CartesianGrid vertical={false} />{axis.x}{axis.y}<ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="leads" fill="var(--color-leads)" radius={4} /></BarChart>
            </ChartContainer>
          </ChartCard>
          <ChartCard title="Ad spend vs results">
            <ChartContainer config={{ spend: { label: "Spend ($)", color: "var(--chart-4)" }, results: { label: "Results", color: "var(--chart-1)" } }} className="h-64 w-full">
              <LineChart data={data ?? []}><CartesianGrid vertical={false} />{axis.x}{axis.y}<ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="spend" stroke="var(--color-spend)" strokeWidth={2} dot={false} /><Line dataKey="results" stroke="var(--color-results)" strokeWidth={2} dot={false} /></LineChart>
            </ChartContainer>
          </ChartCard>
        </div>
      )}
    </AppShell>
  );
}
