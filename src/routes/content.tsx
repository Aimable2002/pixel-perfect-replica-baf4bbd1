import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Facebook, Image as ImageIcon, Instagram, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/kaliza/AppShell";
import { CardSkeletons, EmptyState, PageHeader, StatusBadge, fmtTime } from "@/components/kaliza/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMediaLibrary, getPosts, savePost, updatePostStatus, type Post, type PostStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "Content — Kaliza" },
      { name: "description", content: "Plan, approve and schedule Instagram and Facebook posts with Kaliza." },
      { property: "og:title", content: "Content — Kaliza" },
      { property: "og:description", content: "Content calendar, approval queue and media library." },
    ],
  }),
  component: ContentPage,
});

const PlatformIcon = ({ p }: { p: Post["platform"] }) =>
  p === "instagram" ? <Instagram className="size-3.5" /> : <Facebook className="size-3.5" />;

function ContentPage() {
  const qc = useQueryClient();
  const posts = useQuery({ queryKey: ["posts"], queryFn: getPosts });
  const media = useQuery({ queryKey: ["media"], queryFn: getMediaLibrary });
  const [filter, setFilter] = useState<PostStatus | "all">("all");
  const [editing, setEditing] = useState<Partial<Post> | null>(null);

  const setStatus = async (id: string, status: PostStatus) => {
    await updatePostStatus(id, status);
    qc.invalidateQueries({ queryKey: ["posts"] });
    toast.success(status === "scheduled" ? "Approved and scheduled" : `Moved to ${status}`);
  };

  const list = (posts.data ?? []).filter((p) => filter === "all" || p.status === filter);
  const pending = (posts.data ?? []).filter((p) => p.status === "pending");

  return (
    <AppShell>
      <PageHeader title="Content" description="Everything Kaliza is creating, scheduling and publishing."
        actions={<Button onClick={() => setEditing({ platform: "instagram", format: "feed", status: "draft", date: new Date().toISOString(), image: "https://picsum.photos/seed/new/600/600", caption: "" })}><Plus className="size-4" /> New post</Button>} />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="approval">Approval{pending.length > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{pending.length}</span>}</TabsTrigger>
          <TabsTrigger value="media">Media library</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          {posts.isLoading ? <CardSkeletons count={1} className="h-96" /> : <Calendar posts={posts.data ?? []} onOpen={setEditing} />}
        </TabsContent>

        <TabsContent value="posts" className="mt-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {(["all", "draft", "pending", "scheduled", "published"] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f === "pending" ? "Awaiting approval" : f}</Button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {posts.isLoading ? <CardSkeletons count={8} className="h-72" /> : list.length === 0 ? (
              <div className="col-span-full"><EmptyState title="No posts here" body="Try another filter or ask Kaliza to draft some." /></div>
            ) : list.map((p) => (
              <button key={p.id} onClick={() => setEditing(p)} className="overflow-hidden rounded-xl border bg-card text-left shadow-card transition-shadow hover:shadow-elegant">
                <img src={p.image} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                <div className="space-y-2 p-3">
                  <div className="flex items-center justify-between"><StatusBadge status={p.status} /><span className="flex items-center gap-1 text-xs capitalize text-muted-foreground"><PlatformIcon p={p.platform} />{p.format}</span></div>
                  <p className="line-clamp-2 text-sm">{p.caption}</p>
                  <p className="text-xs text-muted-foreground">{fmtTime(p.date)}</p>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approval" className="mt-4 space-y-3">
          {posts.isLoading ? <CardSkeletons count={2} className="h-32" /> : pending.length === 0 ? (
            <EmptyState icon={<Check className="size-5" />} title="All caught up" body="Nothing waiting for approval. Kaliza will notify you on WhatsApp when new drafts are ready." />
          ) : pending.map((p) => (
            <div key={p.id} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row">
              <img src={p.image} alt="" className="size-28 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground"><PlatformIcon p={p.platform} />{p.format} · {fmtTime(p.date)}</p>
                <p className="mt-1 text-sm">{p.caption}</p>
                <p className="mt-2 text-xs text-muted-foreground">Kaliza: “Carousels on this topic get 2.4x saves for your audience.”</p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                <Button size="sm" onClick={() => setStatus(p.id, "scheduled")}><Check className="size-4" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => setStatus(p.id, "draft")}><X className="size-4" /> Reject</Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {media.isLoading ? <CardSkeletons count={12} className="aspect-square h-auto" /> : media.data?.map((m) => (
              <div key={m.id} className="group relative overflow-hidden rounded-lg border">
                <img src={m.url} alt={m.name} className="aspect-square w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1 left-1 rounded bg-background/85 px-1.5 text-[10px]">{m.type}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <PostEditor post={editing} onClose={() => setEditing(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["posts"] })} />
    </AppShell>
  );
}

function Calendar({ posts, onOpen }: { posts: Post[]; onOpen: (p: Post) => void }) {
  const [offset, setOffset] = useState(0);
  const { days, label } = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    const first = new Date(base);
    first.setDate(1 - ((base.getDay() + 6) % 7));
    return {
      label: base.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      days: Array.from({ length: 42 }, (_, i) => { const d = new Date(first); d.setDate(first.getDate() + i); return { d, inMonth: d.getMonth() === base.getMonth() }; }),
    };
  }, [offset]);
  const today = new Date().toDateString();

  return (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{label}</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setOffset(offset - 1)} aria-label="Previous month"><ChevronLeft className="size-4" /></Button>
          <Button size="sm" variant="ghost" onClick={() => setOffset(0)}>Today</Button>
          <Button size="icon" variant="ghost" onClick={() => setOffset(offset + 1)} aria-label="Next month"><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map(({ d, inMonth }) => {
          const items = posts.filter((p) => new Date(p.date).toDateString() === d.toDateString());
          return (
            <div key={d.toISOString()} className={cn("min-h-24 border-b border-r p-1.5", !inMonth && "bg-muted/40")}>
              <span className={cn("inline-grid size-6 place-items-center rounded-full text-xs", d.toDateString() === today ? "bg-primary text-primary-foreground" : inMonth ? "" : "text-muted-foreground")}>{d.getDate()}</span>
              <div className="mt-1 space-y-1">
                {items.map((p) => (
                  <button key={p.id} onClick={() => onOpen(p)} className={cn("block w-full truncate rounded px-1.5 py-0.5 text-left text-[11px]",
                    p.status === "published" ? "bg-success/15 text-success" : p.status === "scheduled" ? "bg-primary/10 text-primary" : p.status === "pending" ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground")}>
                    {p.caption}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostEditor({ post, onClose, onSaved }: { post: Partial<Post> | null; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState<Partial<Post>>({});
  const [saving, setSaving] = useState(false);
  const current = { ...post, ...draft };
  const close = () => { setDraft({}); onClose(); };

  const save = async (status?: PostStatus) => {
    if (!current.caption?.trim()) return toast.error("Add a caption first");
    setSaving(true);
    await savePost({ ...(current as Post), status: status ?? current.status ?? "draft" });
    setSaving(false);
    onSaved();
    toast.success(post?.id ? "Post updated" : "Post created");
    close();
  };

  return (
    <Dialog open={!!post} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{post?.id ? "Edit post" : "Create post"}</DialogTitle></DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <div className="relative overflow-hidden rounded-lg border bg-muted">
            {current.image ? <img src={current.image} alt="" className="aspect-square w-full object-cover" /> : <ImageIcon className="m-auto size-8" />}
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Caption</Label><Textarea rows={4} value={current.caption ?? ""} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Platform</Label>
                <Select value={current.platform} onValueChange={(v) => setDraft({ ...draft, platform: v as Post["platform"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="instagram">Instagram</SelectItem><SelectItem value="facebook">Facebook</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Format</Label>
                <Select value={current.format} onValueChange={(v) => setDraft({ ...draft, format: v as Post["format"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["feed", "carousel", "reel", "story"].map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Publish at</Label>
              <Input type="datetime-local" value={current.date ? new Date(current.date).toISOString().slice(0, 16) : ""} onChange={(e) => setDraft({ ...draft, date: new Date(e.target.value).toISOString() })} />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={saving} onClick={() => save("draft")}>Save draft</Button>
          <Button disabled={saving} onClick={() => save("scheduled")}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
