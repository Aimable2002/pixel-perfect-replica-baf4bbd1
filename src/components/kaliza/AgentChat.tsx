import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Mic } from "lucide-react";
import { getAgentHistory, sendAgentMessage, type AgentMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { KalizaMark } from "./common";
import { cn } from "@/lib/utils";

export const AGENT_PROMPTS = [
  "Prepare 5 post ideas for next week",
  "Show me underperforming ads",
  "Suggest a reply for my top DM",
  "How did we do this week?",
];

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const quote = line.startsWith("> ");
    const bullet = line.startsWith("- ");
    const parts = (quote || bullet ? line.slice(2) : line).split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>,
    );
    if (!line.trim()) return <div key={i} className="h-2" />;
    return quote ? (
      <blockquote key={i} className="my-1 border-l-2 border-primary pl-3 italic text-muted-foreground">{parts}</blockquote>
    ) : (
      <p key={i}>{bullet ? <>• {parts}</> : parts}</p>
    );
  });
}

export function AgentChat({ compact = false }: { compact?: boolean }) {
  const qc = useQueryClient();
  const { data: history, isLoading } = useQuery({ queryKey: ["agent-history"], queryFn: getAgentHistory });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (history) setMessages(history); }, [history]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t, time: new Date().toISOString() }]);
    setThinking(true);
    const reply = await sendAgentMessage(t);
    setMessages((m) => [...m, reply]);
    setThinking(false);
    qc.invalidateQueries({ queryKey: ["agent-history"], refetchType: "none" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex-1 space-y-5 overflow-y-auto", compact ? "p-4" : "p-6")}>
        {isLoading && <p className="text-sm text-muted-foreground">Loading conversation…</p>}
        {messages.map((m) =>
          m.role === "agent" ? (
            <div key={m.id} className="flex gap-3">
              <KalizaMark className="size-7 shrink-0" />
              <div className="space-y-1 text-sm leading-relaxed text-foreground">{renderText(m.text)}</div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.text}</div>
            </div>
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-3">
            <KalizaMark className="size-7 shrink-0" />
            <div className="flex gap-1">
              {[0, 150, 300].map((d) => (
                <span key={d} className="size-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className={cn("border-t bg-card", compact ? "p-3" : "p-4")}>
        {messages.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {AGENT_PROMPTS.map((p) => (
              <button key={p} onClick={() => send(p)} className="rounded-full border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary">
                {p}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask Kaliza to create content, analyze ads, reply…"
            rows={1}
            className="min-h-9 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button type="button" size="icon" variant="ghost" aria-label="Voice (coming soon)" title="Voice coming soon"><Mic className="size-4" /></Button>
          <Button type="submit" size="icon" disabled={!input.trim() || thinking} aria-label="Send"><ArrowUp className="size-4" /></Button>
        </form>
      </div>
    </div>
  );
}
