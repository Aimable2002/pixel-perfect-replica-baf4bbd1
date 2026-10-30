import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Facebook, Instagram, Megaphone, MessageCircle, Loader2 } from "lucide-react";
import { KalizaMark } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Kaliza" },
      { name: "description", content: "Connect Instagram, Facebook, Meta Ads and WhatsApp, then tell Kaliza about your brand." },
      { property: "og:title", content: "Get started — Kaliza" },
      { property: "og:description", content: "Connect your accounts and set up your brand in minutes." },
    ],
  }),
  component: Onboarding,
});

const steps = [
  { id: "instagram", title: "Connect Instagram", body: "Kaliza publishes posts and replies to comments & DMs.", icon: Instagram },
  { id: "facebook", title: "Connect Facebook Page", body: "Manage your Page posts, comments and Messenger.", icon: Facebook },
  { id: "ads", title: "Connect Meta Ad Account", body: "Let Kaliza monitor and optimize your campaigns.", icon: Megaphone },
  { id: "whatsapp", title: "Connect WhatsApp", body: "Your daily control center — text or voice Kaliza.", icon: MessageCircle },
  { id: "brand", title: "Brand & goals", body: "Help Kaliza sound like you.", icon: Check },
];
const goals = ["More bookings", "More followers", "More leads", "Lower ad costs", "Faster replies"];

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState(false);
  const [picked, setPicked] = useState<string[]>(["More bookings"]);
  const s = steps[step]!;
  const Icon = s.icon;

  const connect = () => {
    setConnecting(true);
    setTimeout(() => { setConnected((c) => ({ ...c, [s.id]: true })); setConnecting(false); }, 900);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="mb-8 flex items-center gap-2.5"><KalizaMark /><span className="font-display text-lg font-semibold">Kaliza</span></div>
        <p className="text-xs font-medium text-muted-foreground">Step {step + 1} of {steps.length}</p>
        <Progress value={((step + 1) / steps.length) * 100} className="mt-2" />

        <div className="mt-8 rounded-2xl border bg-card p-8 shadow-card">
          <div className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-6" /></div>
          <h1 className="mt-4 text-2xl font-semibold">{s.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>

          {s.id !== "brand" ? (
            <div className="mt-6">
              {connected[s.id] ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm font-medium text-success"><Check className="size-4" /> Connected</div>
              ) : (
                <Button onClick={connect} disabled={connecting} className="w-full">
                  {connecting && <Loader2 className="size-4 animate-spin" />} {connecting ? "Connecting…" : s.title}
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="space-y-2"><Label>What do you sell?</Label><Input placeholder="Mediterranean bistro, brunch & private events" /></div>
              <div className="space-y-2"><Label>Brand voice</Label><Textarea placeholder="Warm, a little playful, never pushy. Use emojis sparingly." /></div>
              <div className="space-y-2">
                <Label>Top goals</Label>
                <div className="flex flex-wrap gap-2">
                  {goals.map((g) => (
                    <button key={g} type="button" onClick={() => setPicked((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g])}
                      className={cn("rounded-full border px-3 py-1.5 text-xs", picked.includes(g) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary")}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <div className="flex gap-2">
            {s.id !== "brand" && !connected[s.id] && <Button variant="outline" onClick={() => setStep(step + 1)}>Skip</Button>}
            <Button onClick={() => (step === steps.length - 1 ? nav({ to: "/" }) : setStep(step + 1))} disabled={s.id !== "brand" && !connected[s.id]}>
              {step === steps.length - 1 ? "Finish setup" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
