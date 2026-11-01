import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cheapestCoveringPlan, clampUsage, describeRate, formatQuantity, groupResources, quoteCustom, usageFromPlan, usd } from "@/lib/pricing";
import type { PricingCatalog, PricingPlan, PromoCode, ResourceKey, UsageMap, UsageResource } from "@/lib/types";
import { PriceBlock } from "./PriceBlock";

interface Props {
  catalog: PricingCatalog;
  annual: boolean;
  promo: PromoCode | null;
  onChoose: (usage: UsageMap, monthlyPrice: number) => void;
  onChoosePlan: (plan: PricingPlan) => void;
}

/** Number box that lets people type freely and commits a clamped value. */
function UsageInput({ resource, value, onChange }: { resource: UsageResource; value: number; onChange: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);

  const parse = (raw: string) => Number(raw.replace(/[,\s]/g, ""));

  return (
    <div>
      <Input
        id={`usage-${resource.key}`}
        inputMode="numeric"
        // Show what was typed only while it still means the current value (for example "5" on the way to "500");
        // if something else changed the value, such as a plan preset, show the real value.
        value={draft !== null && clampUsage(resource, parse(draft)) === value ? draft : String(value)}
        onChange={(e) => {
          const n = parse(e.target.value);
          const typed = e.target.value.trim() !== "" && Number.isFinite(n);
          // Typing past the maximum snaps to it straight away; going below the minimum is left alone
          // until the box loses focus, so "50" can be typed on the way to "500".
          setDraft(typed && n > resource.max ? String(resource.max) : e.target.value);
          if (typed) onChange(clampUsage(resource, n));
        }}
        onBlur={() => setDraft(null)}
        aria-describedby={`usage-${resource.key}-shown`}
      />
      <p id={`usage-${resource.key}-shown`} className="mt-1 text-right text-xs text-muted-foreground">
        {formatQuantity(resource, value)}
      </p>
    </div>
  );
}

export function CustomPlanCard({ catalog, annual, promo, onChoose, onChoosePlan }: Props) {
  const startingPlan = catalog.plans.find((p) => p.popular) ?? catalog.plans[0];
  const [usage, setUsage] = useState<UsageMap>(() =>
    startingPlan ? usageFromPlan(catalog, startingPlan) : (Object.fromEntries(catalog.resources.map((r) => [r.key, r.min])) as UsageMap),
  );

  const quote = useMemo(() => quoteCustom(catalog, usage), [catalog, usage]);
  const covering = useMemo(() => cheapestCoveringPlan(catalog, usage), [catalog, usage]);
  const groups = useMemo(() => groupResources(catalog), [catalog]);
  const resourceByKey = useMemo(() => new Map(catalog.resources.map((r) => [r.key, r])), [catalog]);

  const set = (key: ResourceKey, value: number) => setUsage((old) => ({ ...old, [key]: value }));
  const cheaperPlan = covering && covering.price < quote.monthly ? covering : null;

  return (
    <section aria-labelledby="custom-plan-title" className="rounded-lg border bg-card">
      <div className="border-b p-6">
        <p className="hud-label">Custom plan</p>
        <h2 id="custom-plan-title" className="mt-3 text-2xl font-semibold">Build a plan around your usage.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Set the allowance for every service your operator uses. The price updates as you go, and we’ll tell you if a standard plan already covers it for less.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Start from</span>
          {catalog.plans.map((plan) => (
            <Button key={plan.id} type="button" size="sm" variant="outline" onClick={() => setUsage(usageFromPlan(catalog, plan))}>
              {plan.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_22rem]">
        <div className="divide-y p-6">
          {groups.map((group) => (
            <div key={group.id} className="py-6 first:pt-0 last:pb-0">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <div className="mt-2 divide-y">
                {group.resources.map((r) => (
                  <div key={r.key} className="grid gap-4 py-5 sm:grid-cols-[1fr_9rem] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <Label htmlFor={`usage-${r.key}`} className="text-sm font-medium">{r.label}</Label>
                        <span className="text-xs text-muted-foreground">{r.provider}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {r.summary} {describeRate(r)}.
                      </p>
                      <Slider
                        className="mt-4"
                        min={r.min}
                        max={r.max}
                        step={r.step}
                        value={[usage[r.key]]}
                        onValueChange={([v]) => set(r.key, v ?? r.min)}
                        aria-label={`${r.label} per month`}
                      />
                    </div>
                    <UsageInput resource={r} value={usage[r.key]} onChange={(n) => set(r.key, n)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="border-t bg-muted/30 p-6 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-6">
            <h3 className="font-semibold">Your plan</h3>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="flex justify-between gap-3">
                <span title="Covers your always-on sandbox">Platform fee</span>
                <span>{usd(quote.baseFee)}</span>
              </li>
              {quote.lines.map((line) => {
                const resource = resourceByKey.get(line.key);
                return (
                  <li key={line.key} className="flex justify-between gap-3">
                    <span>
                      {line.label}
                      {resource && <span className="block text-muted-foreground">{formatQuantity(resource, line.amount)}</span>}
                    </span>
                    <span className={line.cost > 0 ? "" : "text-muted-foreground"}>{line.cost > 0 ? usd(line.cost) : "Included"}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 border-t pt-6">
              <PriceBlock regular={quote.monthly} target="custom" promo={promo} annual={annual} />
            </div>

            {cheaperPlan && (
              <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
                <p>
                  <span className="font-semibold">{cheaperPlan.name}</span> already covers this for {usd(cheaperPlan.price)}/month, {usd(quote.monthly - cheaperPlan.price)} less.
                </p>
                <Button type="button" variant="link" className="mt-1 h-auto p-0 text-xs" onClick={() => onChoosePlan(cheaperPlan)}>
                  Choose {cheaperPlan.name} instead
                </Button>
              </div>
            )}
            {!covering && (
              <p className="mt-2 text-xs text-muted-foreground">No standard plan covers this mix, so a custom plan is the right fit.</p>
            )}

            <Button className="mt-5 w-full" onClick={() => onChoose(usage, quote.monthly)}>
              Choose custom plan
              <ArrowUpRight className="size-4" />
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">Rates are proposed. Checkout is not activated.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
