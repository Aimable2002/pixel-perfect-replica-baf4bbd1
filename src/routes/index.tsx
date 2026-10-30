import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bot, CalendarPlus, Inbox, Megaphone, MessageSquareReply, PenSquare, Sparkles as _S, Target, Users } from "lucide-react";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, PageHeader, StatCard, fmtTime } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { getActivityFeed, getAgentSuggestions, getDashboardMetrics } from "@/lib/api";

void _S;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Kaliza" },
      { name: "description", content: "Your business at a glance: reach, engagement, leads, ads and everything Kaliza did for you." },
      { property: "og:title", content: "Overview — Kaliza" },
      { property: "og:description", content: "Your business at a glance with Kaliza, the AI growth operator for Meta." },
    ],
  }),
  component: Home,
});

const activityIcon = { reply: MessageSquareReply, lead: Users, ad: Megaphone, post: PenSquare, whatsapp: Bot };

function Home() {
  const metrics = useQuery({ queryKey: ["metrics"], queryFn: getDashboardMetrics });
  const activity = useQuery({ queryKey: ["activity"], queryFn: getActivityFeed });
  const suggestions = useQuery({ queryKey: ["suggestions"], queryFn: getAgentSuggestions });

  return (
    <AppShell>
      <PageHeader title="Good morning, Clement" description="Here's what Kaliza handled for La Villa Bistro while you were away." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.isLoading ? <CardSkeletons /> : metrics.data?.map((m) => <StatCard key={m.id} {...m} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-xl bg-gradient-hero p-6 text-sidebar-accent-foreground lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-sidebar-primary">Agent highlights</p>
          <h2 className="mt-1 text-xl font-semibold">3 things worth your attention</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {suggestions.isLoading ? <CardSkeletons count={3} className="h-36 bg-sidebar-accent" /> : suggestions.data?.map((s) => (
              <div key={s.id} className="flex flex-col rounded-lg border border-sidebar-border bg-sidebar-accent/70 p-4">
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-sidebar-foreground">{s.body}</p>
                <Link to={s.id === "s2" ? "/inbox" : s.id === "s1" ? "/ads" : "/content"} className="mt-3 text-xs font-semibold text-sidebar-primary hover:underline">{s.action} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { to: "/content", label: "New post", icon: CalendarPlus },
              { to: "/inbox", label: "Open inbox", icon: Inbox },
              { to: "/ads", label: "New campaign", icon: Target },
              { to: "/agent", label: "Ask Kaliza", icon: Bot },
            ].map(({ to, label, icon: Icon }) => (
              <Button key={label} asChild variant="outline" className="h-20 flex-col gap-2">
                <Link to={to}><Icon className="size-5 text-primary" />{label}</Link>
              </Button>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-semibold">Recent activity</h2>
        <ul className="mt-4 divide-y">
          {activity.isLoading ? <CardSkeletons count={4} className="my-2 h-10" /> : activity.data?.map((a) => {
            const Icon = activityIcon[a.type];
            return (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-4" /></div>
                <p className="flex-1 text-sm">{a.text}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{fmtTime(a.time)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
