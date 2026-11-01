import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PricingCatalog, PricingPlan, PromoCode } from "@/lib/types";
import { AllowanceList } from "./AllowanceList";
import { PriceBlock } from "./PriceBlock";

interface Props {
  plan: PricingPlan;
  catalog: PricingCatalog;
  annual: boolean;
  promo: PromoCode | null;
  onChoose: (plan: PricingPlan) => void;
}

export function PlanCard({ plan, catalog, annual, promo, onChoose }: Props) {
  return (
    <article className={cn("flex flex-col rounded-lg border p-6", plan.popular ? "border-primary bg-primary/5" : "bg-card")}>
      <p className="hud-label">{plan.tagline}</p>
      <h2 className="mt-3 text-xl font-semibold">{plan.name}</h2>
      <div className="mt-6">
        <PriceBlock regular={plan.price} target={plan.id} promo={promo} annual={annual} />
      </div>
      <Button className="mt-2 w-full" variant={plan.popular ? "default" : "outline"} onClick={() => onChoose(plan)}>
        Choose {plan.name}
        <ArrowUpRight className="size-4" />
      </Button>

      <h3 className="mt-8 text-xs font-semibold">Included every month</h3>
      <div className="mt-4">
        <AllowanceList plan={plan} resources={catalog.resources} />
      </div>

      <ul className="mt-8 space-y-2.5 border-t pt-6 text-xs">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
            {feature}
          </li>
        ))}
      </ul>
      {plan.note && <p className="mt-5 text-xs text-muted-foreground">{plan.note}</p>}
    </article>
  );
}
