import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/kaliza/AppShell";
import { AgentChat } from "@/components/kaliza/AgentChat";
import { KalizaMark } from "@/components/kaliza/common";

export const Route = createFileRoute("/_authenticated/agent")({
  head: () => ({
    meta: [
      { title: "Talk to Kaliza — Kaliza" },
      { name: "description", content: "Chat with your Kaliza agent to create content, analyze ads, reply to customers and more." },
      { property: "og:title", content: "Talk to Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Your AI growth operator, one message away." },
    ],
  }),
  component: AgentPage,
});

function AgentPage() {
  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex h-[calc(100vh-9rem)] min-h-[520px] flex-col overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <KalizaMark />
            <div><p className="font-semibold">Kaliza</p><p className="text-xs text-muted-foreground">Same agent as on WhatsApp · history is shared</p></div>
          </div>
          <div className="min-h-0 flex-1"><AgentChat /></div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="font-semibold">Kaliza can</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Draft and schedule posts</li><li>• Analyze and adjust ads</li><li>• Suggest and send replies</li><li>• Summarize leads and results</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-muted/50 p-5 text-sm text-muted-foreground">
            For your security, Kaliza can't change account settings, permissions or billing.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
