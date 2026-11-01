import { formatQuantity } from "@/lib/pricing";
import type { PricingPlan, UsageResource } from "@/lib/types";

/** What a plan includes each month, one line per metered resource. */
export function AllowanceList({ plan, resources }: { plan: PricingPlan; resources: UsageResource[] }) {
  return (
    <dl className="space-y-2.5 text-xs">
      {resources.map((r) => {
        const amount = plan.includes[r.key];
        return (
          <div key={r.key} className="flex items-baseline justify-between gap-3">
            <dt className="text-muted-foreground" title={`${r.summary} Delivered by ${r.provider}.`}>
              {r.label}
            </dt>
            <dd className={amount ? "font-medium" : "text-muted-foreground"}>
              {amount ? formatQuantity(r, amount) : "None"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
