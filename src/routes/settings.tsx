import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, PageHeader } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getConnectedAccounts, getTeam, inviteTeamMember, toggleAccountConnection } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kaliza" },
      { name: "description", content: "Connected accounts, notifications, agent behavior, team and billing." },
      { property: "og:title", content: "Settings — Kaliza" },
      { property: "og:description", content: "Manage how Kaliza works for your business." },
    ],
  }),
  component: SettingsPage,
});

function Row({ title, body, children }: { title: string; body?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-4 last:border-0">
      <div><p className="text-sm font-medium">{title}</p>{body && <p className="text-xs text-muted-foreground">{body}</p>}</div>
      {children}
    </div>
  );
}
const Card = ({ children }: { children: React.ReactNode }) => <div className="rounded-xl border bg-card px-5 shadow-card">{children}</div>;

function SettingsPage() {
  const qc = useQueryClient();
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: getConnectedAccounts });
  const team = useQuery({ queryKey: ["team"], queryFn: getTeam });
  const [busy, setBusy] = useState<string | null>(null);
  const [invite, setInvite] = useState("");
  const [threshold, setThreshold] = useState([500]);

  return (
    <AppShell>
      <PageHeader title="Settings" />
      <Tabs defaultValue="accounts">
        <TabsList className="flex-wrap">
          <TabsTrigger value="accounts">Connected accounts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="agent">Agent behavior</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4 max-w-2xl">
          <Card>
            {accounts.isLoading ? <div className="py-4"><CardSkeletons count={4} className="my-2 h-12" /></div> : accounts.data?.map((a) => (
              <Row key={a.id} title={a.name} body={a.connected ? a.handle : "Not connected"}>
                <Button size="sm" variant={a.connected ? "outline" : "default"} disabled={busy === a.id} onClick={async () => {
                  setBusy(a.id); await toggleAccountConnection(a.id); setBusy(null); qc.invalidateQueries({ queryKey: ["accounts"] });
                  toast.success(a.connected ? `${a.name} disconnected` : `${a.name} connected`);
                }}>{busy === a.id ? "…" : a.connected ? "Disconnect" : "Connect"}</Button>
              </Row>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 max-w-2xl">
          <Card>
            <Row title="Hot lead alerts on WhatsApp" body="Instant message when a high-value lead appears"><Switch defaultChecked /></Row>
            <Row title="Daily summary" body="Morning recap via WhatsApp voice note"><Switch defaultChecked /></Row>
            <Row title="Ad spend alerts" body="When a campaign overspends by 20%+"><Switch defaultChecked /></Row>
            <Row title="Weekly email report"><Switch /></Row>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="mt-4 max-w-2xl">
          <Card>
            <Row title="Auto-reply to comments" body="Kaliza replies to public comments without approval"><Switch defaultChecked /></Row>
            <Row title="Auto-reply to DMs" body="Routine questions only — pricing & bookings go to you"><Switch defaultChecked /></Row>
            <Row title="Publish without approval"><Switch /></Row>
            <Row title="Let Kaliza adjust ad budgets" body="Within ±20% of the daily budget"><Switch defaultChecked /></Row>
            <div className="border-b py-4">
              <div className="flex justify-between"><p className="text-sm font-medium">Escalate deals above</p><span className="text-sm font-semibold">${threshold[0]}</span></div>
              <Slider className="mt-3" value={threshold} onValueChange={setThreshold} min={100} max={5000} step={100} />
            </div>
            <div className="py-4"><Label>Brand voice</Label><Input className="mt-2" defaultValue="Warm, a little playful, never pushy." /></div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4 max-w-2xl space-y-4">
          <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!invite.includes("@")) return toast.error("Enter a valid email"); await inviteTeamMember(invite); setInvite(""); qc.invalidateQueries({ queryKey: ["team"] }); toast.success("Invite sent"); }}>
            <Input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="teammate@business.com" type="email" />
            <Button>Invite</Button>
          </form>
          <Card>
            {team.isLoading ? <div className="py-4"><CardSkeletons count={3} className="my-2 h-10" /></div> : team.data?.map((m) => (
              <Row key={m.id} title={m.name} body={m.email}><Badge variant="secondary">{m.role}</Badge></Row>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 max-w-2xl">
          <div className="rounded-xl bg-gradient-hero p-6 text-sidebar-accent-foreground">
            <p className="text-xs uppercase tracking-wider text-sidebar-primary">Current plan</p>
            <p className="mt-1 font-display text-2xl font-semibold">Pro · $149/mo</p>
            <p className="mt-1 text-sm text-sidebar-foreground">2 brands · unlimited replies · ads management · WhatsApp voice</p>
            <div className="mt-4 flex gap-2"><Button variant="secondary" onClick={() => toast("Billing portal coming soon")}>Manage billing</Button></div>
          </div>
          <Card><Row title="Next invoice" body="Nov 30, 2026"><span className="text-sm font-medium">$149.00</span></Row><Row title="Payment method" body="Visa •••• 4242"><Button size="sm" variant="ghost">Update</Button></Row></Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
