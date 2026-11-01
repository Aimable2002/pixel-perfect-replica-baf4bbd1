import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CreditCard, Download } from "lucide-react";
import { AppShell } from "@/components/kaliza/AppShell";
import { AllowanceList } from "@/components/kaliza/AllowanceList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getCheckoutIntent, getPricingCatalog, getUsageSnapshot, validatePromoCode } from "@/lib/api";
import { pageHead } from "@/lib/page-head";
import { applyPromo, formatQuantity, groupResources, lifecycleText, promoApplies, promoDuration, usd } from "@/lib/pricing";
import type { PricingPlan, UsageResource, UsageSnapshot } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => pageHead("Billing & usage", "Review your Kaliza plan, usage and invoice history."),
  component: Billing,
});

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function Meter({ resource, snapshot }: { resource: UsageResource; snapshot: UsageSnapshot }) {
  const used = snapshot.used[resource.key];
  const limit = snapshot.limits[resource.key];
  const percent = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const state = limit > 0 && used >= limit ? "Allowance reached" : percent >= 85 ? "Nearly used" : null;

  return (
    <div>
      <div className="flex justify-between gap-3 text-xs">
        <span title={resource.counts}>{resource.label}</span>
        <span className="text-muted-foreground">
          {limit > 0 ? `${formatQuantity(resource, used)} of ${formatQuantity(resource, limit)}` : "Not in your plan"}
        </span>
      </div>
      <Progress className="mt-3 h-1.5" value={percent} aria-label={`${resource.label} used`} />
      {state && <p className="mt-1.5 text-xs text-warning-foreground">{state}</p>}
    </div>
  );
}

function Billing() {
  const { data: snapshot } = useQuery({ queryKey: ["usage-snapshot"], queryFn: getUsageSnapshot });
  const { data: catalog } = useQuery({ queryKey: ["pricing-catalog"], queryFn: getPricingCatalog });
  const { data: intent } = useQuery({ queryKey: ["checkout-intent"], queryFn: getCheckoutIntent });
  const promoCode = intent?.promoCode;
  const { data: promoResult } = useQuery({
    queryKey: ["intent-promo", promoCode],
    queryFn: () => validatePromoCode(promoCode ?? ""),
    enabled: !!promoCode,
  });
  const [reviewing, setReviewing] = useState<PricingPlan | null>(null);

  const currentPlan = catalog?.plans.find((p) => p.id === snapshot?.planId);
  const chosenPlan = intent?.kind === "plan" ? catalog?.plans.find((p) => p.id === intent.planId) : undefined;
  const chosenName = intent?.kind === "custom" ? "Custom plan" : chosenPlan?.name;
  const chosenTarget = intent?.kind === "custom" ? "custom" : intent?.planId ?? "";
  const promo = promoResult?.valid ? promoResult.promo : null;
  const chosenPrice = intent ? applyPromo(intent.monthlyPrice, promo && promoApplies(promo, chosenTarget) ? promo : null, chosenTarget) : null;

  return (
    <AppShell>
      <p className="hud-label">Your account, clearly</p>
      <h1 className="mt-3 text-3xl font-semibold">Billing & usage.</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="border-y py-6">
          <p className="hud-label">{!snapshot ? "Loading plan" : snapshot.planId ? (snapshot.isDemo ? "Demo plan" : "Current plan") : "No active paid subscription"}</p>
          <h2 className="mt-4 text-3xl font-semibold">
            {currentPlan ? `${currentPlan.name}, ${usd(currentPlan.price)}/month` : "Choose your plan"}
          </h2>
          {snapshot?.planId && (
            <p className="mt-3 text-sm text-muted-foreground">
              Usage period {fmtDay(snapshot.periodStart)} to {fmtDay(snapshot.periodEnd)}.
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">Payments are not activated. No card will be charged.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/pricing">
              Compare plans
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>

          {intent && chosenPrice && chosenName && (
            <div className="mt-8 rounded-lg border bg-card p-4 text-sm">
              <p className="font-semibold">Your pricing choice: {chosenName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {usd(chosenPrice.monthly)}/month
                {chosenPrice.applied && promo ? ` with ${promo.code}, ${promoDuration(promo)}` : ""}. Nothing is charged until payments are activated.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-8 border-y py-6">
          <p className="hud-label">Monthly usage {snapshot?.isDemo ? "/ Demo" : ""}</p>
          {snapshot && catalog ? (
            groupResources(catalog).map((group) => (
              <div key={group.id} className="space-y-5">
                <h3 className="text-xs font-semibold">{group.title}</h3>
                {group.resources.map((r) => (
                  <Meter key={r.key} resource={r} snapshot={snapshot} />
                ))}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Loading usage…</p>
          )}
          {catalog && <p className="border-t pt-5 text-xs leading-relaxed text-muted-foreground">{catalog.overagePolicy}</p>}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">A plan for your next stage</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalog?.plans.map((p) => (
            <article key={p.id} className="rounded-lg border bg-card p-5">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-4 text-2xl font-semibold">
                {usd(p.price)}
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {p.includes.brands} brands, {p.includes.agentRequests} agent requests, {p.includes.voiceMinutes} voice minutes
              </p>
              <Button className="mt-5 w-full" size="sm" variant="outline" onClick={() => setReviewing(p)}>
                Review plan
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-t pt-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CreditCard className="size-4" />
            Payment method
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">No payment method on file.</p>
          <p className="mt-2 text-xs text-muted-foreground">Payment and tax details will be collected through secure checkout once payments are activated.</p>
          {catalog && <p className="mt-2 text-xs text-muted-foreground">{lifecycleText(catalog.lifecycle)}</p>}
        </div>
        <div className="border-t pt-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Download className="size-4" />
            Invoice history
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">No invoices yet. No charges have been made.</p>
        </div>
      </section>

      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewing?.name} plan</DialogTitle>
          </DialogHeader>
          {reviewing && catalog && (
            <>
              <p className="text-sm text-muted-foreground">
                {usd(reviewing.price)}/month, with these allowances every month:
              </p>
              <AllowanceList plan={reviewing} resources={catalog.resources} />
              <p className="text-xs text-muted-foreground">
                Checkout and prorated billing are not activated, so your subscription will not change.
              </p>
            </>
          )}
          <Button variant="outline" onClick={() => setReviewing(null)}>Back to billing</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
