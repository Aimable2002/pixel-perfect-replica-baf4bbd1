import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getAdminPricing, saveAdminPricing } from "@/lib/api";
import {
  breakEvenUse, marginOf, planBaseCost, planCost, pricingProblem, unitCostOf, usd,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { AdminPricing, PricingPlan, UsageResource } from "@/lib/types";
import { NumberField } from "./NumberField";

const pct = (n: number) => `${Math.round(n * 100)}%`;

// Retail rates are stored per single unit but shown the way customers see them
// ("$0.10 per 1,000 events", "0.1% of managed spend").
const rateToDisplay = (r: UsageResource) => (r.rateBasis.percent ? r.rate * 100 : r.rate * r.rateBasis.per);
const rateFromDisplay = (r: UsageResource, shown: number) => (r.rateBasis.percent ? shown / 100 : shown / r.rateBasis.per);
const rateUnitHint = (r: UsageResource) =>
  r.rateBasis.percent ? `% of ${r.rateBasis.unit}` : `per ${r.rateBasis.per > 1 ? `${r.rateBasis.per.toLocaleString()} ` : ""}${r.rateBasis.unit}`;

function Marginal({ value, children }: { value: number; children: ReactNode }) {
  return <span className={cn(value < 0 && "font-medium text-destructive", value >= 0 && value < 0.2 && "font-medium text-warning-foreground")}>{children}</span>;
}

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t pt-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {intro && <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{intro}</p>}
      <div className="mt-5 overflow-x-auto">{children}</div>
    </section>
  );
}

export function AdminPricingPanel({ preview }: { preview: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-pricing"], queryFn: getAdminPricing });
  const [draft, setDraft] = useState<AdminPricing | null>(null);
  const [expectedUse, setExpectedUse] = useState(40);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const save = useMutation({
    mutationFn: saveAdminPricing,
    onSuccess: (next) => {
      qc.setQueryData(["admin-pricing"], next);
      qc.invalidateQueries({ queryKey: ["pricing-catalog"] });
      qc.invalidateQueries({ queryKey: ["usage-snapshot"] });
      setDraft(null);
      setMessage({ kind: "ok", text: "Saved. The public pricing page now shows these prices." });
    },
    onError: (error: Error) => setMessage({ kind: "error", text: error.message }),
  });

  if (isLoading) return <p className="mt-8 text-sm text-muted-foreground">Loading pricing…</p>;
  if (isError || !data) {
    return (
      <div className="mt-8">
        <p role="alert" className="text-sm text-destructive">Pricing couldn’t be loaded.</p>
        <Button className="mt-3" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const pricing = draft ?? data;
  const { catalog } = pricing;
  const problem = pricingProblem(catalog);
  const use = expectedUse / 100;
  const sandboxBase = pricing.baseCosts.find((b) => b.id === "sandbox");

  const edit = (change: (copy: AdminPricing) => void) => {
    const copy = structuredClone(draft ?? data);
    change(copy);
    setDraft(copy);
    setMessage(null);
  };
  const editPlan = (planId: string, change: (plan: PricingPlan) => void) =>
    edit((copy) => {
      const plan = copy.catalog.plans.find((p) => p.id === planId);
      if (plan) change(plan);
    });

  const costFor = (key: UsageResource["key"]) => pricing.costs.find((c) => c.key === key);

  return (
    <div className="mt-8">
      <p className="hud-label">Pricing and cost</p>
      <h2 className="mt-3 text-3xl font-semibold">What things cost, and what customers pay.</h2>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        Provider prices were checked on {new Date(pricing.costsCheckedOn).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}.
        Retail changes go live on the public pricing page as soon as you save. Costs are never shown to customers.
        {preview && " This is a preview, so edits stay in this browser."}
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-6">
        <label className="text-xs">
          <span className="block font-medium">Expected use of allowances</span>
          <span className="mt-1 flex items-center gap-2">
            <NumberField label="Expected use of allowances in percent" className="w-20" value={expectedUse} onChange={(n) => setExpectedUse(Math.min(100, Math.max(0, n)))} />
            <span className="text-muted-foreground">% of each allowance used in a typical month</span>
          </span>
        </label>
        <div className="ml-auto flex items-center gap-3">
          {message && (
            <p role={message.kind === "error" ? "alert" : "status"} className={cn("text-xs", message.kind === "error" ? "text-destructive" : "text-success")}>
              {message.text}
            </p>
          )}
          <Button variant="outline" disabled={!draft || save.isPending} onClick={() => { setDraft(null); setMessage(null); }}>
            Discard changes
          </Button>
          <Button disabled={!draft || !!problem || save.isPending} onClick={() => draft && save.mutate(draft)}>
            {save.isPending ? "Saving…" : "Save pricing"}
          </Button>
        </div>
      </div>
      {problem && <p role="alert" className="mt-3 text-xs text-destructive">{problem}</p>}

      <Section
        title="Always-on costs, counted as the base of every plan"
        intro="Every customer’s sandbox runs 24/7, so this is paid whether or not they use anything. It is part of each plan’s cost before a single request is made."
      >
        <table className="w-full min-w-[44rem] text-left text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">Cost</th>
              <th scope="col" className="py-2 pr-4 font-medium">Per unit, per month</th>
              {catalog.plans.map((p) => (
                <th key={p.id} scope="col" className="py-2 pr-4 font-medium">{p.name} units</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pricing.baseCosts.map((b) => (
              <tr key={b.id} className="border-b align-top">
                <th scope="row" className="max-w-sm py-3 pr-4 font-normal">
                  <span className="block font-medium">{b.label}</span>
                  <details className="mt-1 text-muted-foreground">
                    <summary className="cursor-pointer">How this was worked out</summary>
                    <p className="mt-1 leading-relaxed">{b.basis}</p>
                    <p className="mt-1">Source: {b.source}</p>
                  </details>
                </th>
                <td className="py-3 pr-4">
                  <NumberField
                    label={`${b.label} cost per unit per month`}
                    prefix="$"
                    className="w-28"
                    value={b.monthlyPerUnit}
                    onChange={(v) => edit((c) => { const row = c.baseCosts.find((x) => x.id === b.id); if (row) row.monthlyPerUnit = v; })}
                  />
                </td>
                {catalog.plans.map((p) => (
                  <td key={p.id} className="py-3 pr-4">
                    <NumberField
                      label={`${b.label} units on ${p.name}`}
                      className="w-16"
                      value={b.unitsByPlan[p.id] ?? 0}
                      onChange={(v) => edit((c) => { const row = c.baseCosts.find((x) => x.id === b.id); if (row) row.unitsByPlan[p.id] = v; })}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Metered usage: what it costs us and what we charge"
        intro="Retail prices are what the custom plan builder charges per unit. Plan limits (brands, seats and the like) have no per-unit provider cost."
      >
        <table className="w-full min-w-[52rem] text-left text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">Resource</th>
              <th scope="col" className="py-2 pr-4 font-medium">Our cost per unit</th>
              <th scope="col" className="py-2 pr-4 font-medium">Retail price</th>
              <th scope="col" className="py-2 font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {catalog.resources.map((r) => {
              const cost = costFor(r.key);
              const margin = cost?.unitCost != null ? marginOf(r.rate, cost.unitCost) : null;
              return (
                <tr key={r.key} className="border-b align-top">
                  <th scope="row" className="max-w-sm py-3 pr-4 font-normal">
                    <span className="block font-medium">{r.label}</span>
                    <span className="block text-muted-foreground">{r.provider}</span>
                    {cost && (
                      <details className="mt-1 text-muted-foreground">
                        <summary className="cursor-pointer">{cost.costLabel}</summary>
                        <p className="mt-1 leading-relaxed">{cost.basis}</p>
                        <p className="mt-1">Source: {cost.source}</p>
                      </details>
                    )}
                  </th>
                  <td className="py-3 pr-4">
                    {cost && cost.unitCost !== null ? (
                      <NumberField
                        label={`${r.label} our cost per unit`}
                        prefix="$"
                        className="w-28"
                        value={cost.unitCost}
                        onChange={(v) => edit((c) => { const row = c.costs.find((x) => x.key === r.key); if (row) row.unitCost = v; })}
                      />
                    ) : (
                      <span className="text-muted-foreground">No per-unit cost</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      <NumberField
                        label={`${r.label} retail price`}
                        prefix={r.rateBasis.percent ? undefined : "$"}
                        className="w-28"
                        value={Number(rateToDisplay(r).toFixed(6))}
                        onChange={(v) => edit((c) => { const row = c.catalog.resources.find((x) => x.key === r.key); if (row) row.rate = rateFromDisplay(row, v); })}
                      />
                      <span className="text-muted-foreground">{rateUnitHint(r)}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    {margin === null ? (
                      <span className="text-muted-foreground">Not applicable</span>
                    ) : (
                      <Marginal value={margin}>{margin < 0 ? `Below cost (${pct(margin)})` : pct(margin)}</Marginal>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section
        title="Plans: price, allowances and what they earn"
        intro={`Margins are what is left of the price after our cost. “Fully used” assumes every allowance is spent; “expected use” assumes ${expectedUse}% of each. The always-on base is paid either way.`}
      >
        <table className="w-full min-w-[44rem] text-left text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">&nbsp;</th>
              {catalog.plans.map((p) => (
                <th key={p.id} scope="col" className="py-2 pr-4 font-medium">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <th scope="row" className="py-3 pr-4 font-medium">Monthly price</th>
              {catalog.plans.map((p) => (
                <td key={p.id} className="py-3 pr-4">
                  <NumberField label={`${p.name} monthly price`} prefix="$" className="w-24" value={p.price} onChange={(v) => editPlan(p.id, (plan) => { plan.price = v; })} />
                </td>
              ))}
            </tr>
            {catalog.resources.map((r) => (
              <tr key={r.key} className="border-b">
                <th scope="row" className="py-2 pr-4 font-normal">{r.label}</th>
                {catalog.plans.map((p) => (
                  <td key={p.id} className="py-2 pr-4">
                    <NumberField label={`${p.name} ${r.label} allowance`} className="w-24" value={p.includes[r.key]} onChange={(v) => editPlan(p.id, (plan) => { plan.includes[r.key] = v; })} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Always-on base cost</th>
              {catalog.plans.map((p) => <td key={p.id} className="py-3 pr-4">{usd(planBaseCost(pricing, p))}</td>)}
            </tr>
            <tr className="border-b bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Cost if fully used</th>
              {catalog.plans.map((p) => <td key={p.id} className="py-3 pr-4">{usd(planCost(pricing, p, 1))}</td>)}
            </tr>
            <tr className="border-b bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Margin if fully used</th>
              {catalog.plans.map((p) => {
                const m = marginOf(p.price, planCost(pricing, p, 1));
                return <td key={p.id} className="py-3 pr-4"><Marginal value={m}>{pct(m)}</Marginal></td>;
              })}
            </tr>
            <tr className="border-b bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Cost at expected use</th>
              {catalog.plans.map((p) => <td key={p.id} className="py-3 pr-4">{usd(planCost(pricing, p, use))}</td>)}
            </tr>
            <tr className="border-b bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Margin at expected use</th>
              {catalog.plans.map((p) => {
                const m = marginOf(p.price, planCost(pricing, p, use));
                return <td key={p.id} className="py-3 pr-4"><Marginal value={m}>{pct(m)}</Marginal></td>;
              })}
            </tr>
            <tr className="bg-muted/30">
              <th scope="row" className="py-3 pr-4 font-medium">Break-even use</th>
              {catalog.plans.map((p) => {
                const be = breakEvenUse(pricing, p);
                return (
                  <td key={p.id} className="py-3 pr-4">
                    {be < 0 ? <span className="font-medium text-destructive">Base cost exceeds price</span> : be >= 1 ? "Always profitable" : `${pct(be)} of allowances`}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Custom plan and failed payments">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium" htmlFor="base-fee">Custom plan platform fee, per month</label>
            <NumberField label="Custom plan platform fee" prefix="$" className="mt-2 w-28" value={catalog.baseFee} onChange={(v) => edit((c) => { c.catalog.baseFee = v; })} />
            <p className="mt-2 text-xs text-muted-foreground">
              Covers the always-on sandbox
              {sandboxBase && (
                <>
                  , which costs us {usd(sandboxBase.monthlyPerUnit)}.{" "}
                  <Marginal value={marginOf(catalog.baseFee, sandboxBase.monthlyPerUnit)}>
                    Margin on the fee alone: {pct(marginOf(catalog.baseFee, sandboxBase.monthlyPerUnit))}.
                  </Marginal>
                </>
              )}
            </p>
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <span className="block font-medium">Sandbox stays live after a failed payment</span>
              <span className="mt-2 flex items-center gap-2">
                <NumberField label="Days the sandbox stays live after a failed payment" className="w-20" value={catalog.lifecycle.liveAfterFailedPaymentDays} onChange={(v) => edit((c) => { c.catalog.lifecycle.liveAfterFailedPaymentDays = Math.max(0, Math.round(v)); })} />
                <span className="text-muted-foreground">days</span>
              </span>
            </div>
            <div>
              <span className="block font-medium">Backup is kept after it switches off</span>
              <span className="mt-2 flex items-center gap-2">
                <NumberField label="Days the backup is kept" className="w-20" value={catalog.lifecycle.backupKeptDays} onChange={(v) => edit((c) => { c.catalog.lifecycle.backupKeptDays = Math.max(0, Math.round(v)); })} />
                <span className="text-muted-foreground">days</span>
              </span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
