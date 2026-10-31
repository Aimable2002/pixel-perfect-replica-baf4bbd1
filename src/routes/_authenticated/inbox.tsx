import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Facebook, Instagram, Send, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, EmptyState, KalizaMark, PageHeader, StatusBadge, fmtTime } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getConversations, sendReply, updateConversation } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/inbox")({
  validateSearch: (search: Record<string, unknown>) => ({ conversation: typeof search['conversation'] === "string" ? search['conversation'] : undefined }),
  head: () => ({
    meta: [
      { title: "Inbox — Kaliza" },
      { name: "description", content: "Every Instagram and Facebook comment and DM in one place, with replies suggested by Kaliza." },
      { property: "og:title", content: "Inbox — Kaliza" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Unified comments and DMs with AI-suggested replies." },
    ],
  }),
  component: InboxPage,
});

type Filter = "all" | "dm" | "comment" | "needs_owner";

function InboxPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["conversations"], queryFn: getConversations });
  const [filter, setFilter] = useState<Filter>("all");
  const {conversation} = Route.useSearch();
  const [activeId, setActiveId] = useState<string | null>(conversation ?? null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const list = (data ?? []).filter((c) => filter === "all" ? true : filter === "needs_owner" ? c.status === "needs_owner" : c.channel === filter);
  const active = data?.find((c) => c.id === activeId);

  const open = async (id: string) => {
    setActiveId(id);
    setReply("");
    await updateConversation(id, { unread: false });
    qc.invalidateQueries({ queryKey: ["conversations"] });
  };
  const send = async () => {
    if (!active || !reply.trim()) return;
    setSending(true);
    await sendReply(active.id, reply.trim());
    setSending(false);
    setReply("");
    qc.invalidateQueries({ queryKey: ["conversations"] });
    toast.success("Reply sent");
  };

  return (
    <AppShell>
      <PageHeader title="Inbox" description="Kaliza only replies after someone reaches out first. Anything sensitive comes to you." />
      <div className="grid h-[calc(100vh-14rem)] min-h-[520px] overflow-hidden rounded-xl border bg-card shadow-card md:grid-cols-[340px_1fr]">
        <div className={cn("flex min-h-0 flex-col border-r", active && "hidden md:flex")}>
          <div className="flex gap-1 overflow-x-auto border-b p-2">
            {([["all", "All"], ["needs_owner", "Needs you"], ["dm", "DMs"], ["comment", "Comments"]] as const).map(([v, l]) => (
              <Button key={v} size="sm" variant={filter === v ? "secondary" : "ghost"} onClick={() => setFilter(v)}>{l}</Button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? <div className="space-y-2 p-3"><CardSkeletons count={5} className="h-16" /></div> : list.length === 0 ? (
              <div className="p-4"><EmptyState title="Inbox zero" body="No conversations match this filter." /></div>
            ) : list.map((c) => (
              <button key={c.id} onClick={() => open(c.id)} className={cn("flex w-full gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/60", c.id === activeId && "bg-accent")}>
                <div className="relative grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  {c.unread && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("truncate text-sm", c.unread && "font-semibold")}>{c.name}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{fmtTime(c.time)}</span>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                    {c.platform === "instagram" ? <Instagram className="size-3" /> : <Facebook className="size-3" />}
                    {c.channel === "dm" ? "Direct message" : `Comment · ${c.postTitle}`}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{c.messages.at(-1)?.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={cn("flex min-h-0 flex-col", !active && "hidden md:flex")}>
          {!active ? (
            <div className="m-auto p-6"><EmptyState title="Select a conversation" body="Pick a thread to read it and see Kaliza's suggested reply." /></div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setActiveId(null)} aria-label="Back"><ArrowLeft className="size-4" /></Button>
                <div className="flex-1"><p className="font-medium">{active.name}</p><p className="text-xs text-muted-foreground">{active.handle}</p></div>
                <StatusBadge status={active.status} />
                {active.status !== "resolved" && <Button size="sm" variant="outline" onClick={async () => { await updateConversation(active.id, { status: "resolved" }); qc.invalidateQueries({ queryKey: ["conversations"] }); }}>Resolve</Button>}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {active.messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.from !== "customer" && "justify-end")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", m.from === "customer" ? "rounded-bl-md bg-muted" : "rounded-br-md bg-primary text-primary-foreground")}>
                      {m.from === "agent" && <p className="mb-0.5 text-[10px] font-semibold uppercase opacity-75">Kaliza</p>}
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              {active.suggestedReply && (
                <div className="mx-4 mb-3 rounded-xl border border-primary/30 bg-accent p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-accent-foreground"><KalizaMark className="size-5" /> Suggested reply</div>
                  <p className="mt-2 text-sm">{active.suggestedReply}</p>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => setReply(active.suggestedReply ?? "")}><Wand2 className="size-3.5" /> Use this</Button>
                </div>
              )}
              <div className="flex gap-2 border-t p-3">
                <Textarea rows={2} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" className="resize-none" />
                <Button onClick={send} disabled={!reply.trim() || sending} className="self-end"><Send className="size-4" /> Send</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
