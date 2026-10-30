import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveCampaign, type Campaign } from "@/lib/api";

export function CampaignDialog({ open, campaign, onClose, onSaved }: { open: boolean; campaign?: Campaign | null; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("Conversions");
  const [budget, setBudget] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setName(campaign?.name ?? ""); setObjective(campaign?.objective ?? "Conversions"); setBudget(campaign?.budget ?? 30); }
  }, [open, campaign]);

  const save = async () => {
    if (!name.trim()) return toast.error("Give the campaign a name");
    if (budget < 1) return toast.error("Daily budget must be at least $1");
    setSaving(true);
    await saveCampaign({ id: campaign?.id, name: name.trim(), objective, budget });
    setSaving(false);
    toast.success(campaign ? "Campaign updated" : "Draft campaign created");
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{campaign ? "Edit campaign" : "New campaign"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Holiday private events" /></div>
          <div className="space-y-1.5"><Label>Objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Conversions", "Leads", "Reach", "Traffic", "Engagement"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Daily budget (USD)</Label><Input type="number" min={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></div>
          <p className="rounded-lg bg-accent p-3 text-xs text-accent-foreground">Kaliza will suggest audiences and creatives from your best-performing posts once saved.</p>
        </div>
        <DialogFooter><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
