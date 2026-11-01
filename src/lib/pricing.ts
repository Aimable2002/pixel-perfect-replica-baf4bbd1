// Pure pricing helpers. They take the catalog as an argument and know nothing about
// where it came from, so they keep working unchanged when the mock is replaced.
import type {
  AdminPricing,
  PricingCatalog,
  PricingPlan,
  PromoCode,
  ResourceCost,
  ResourceGroup,
  UsageMap,
  UsageResource,
} from "./types";

export const roundMoney = (n: number) => Math.round(n * 100) / 100;

/** $149, $111.75, $1,788 */
export const usd = (n: number) =>
  `$${n.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export const formatQuantity = (resource: UsageResource, amount: number) => {
  const text = amount.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const suffix = amount === 1 && resource.singular ? resource.singular : resource.suffix;
  return `${resource.prefix ?? ""}${text}${suffix}`;
};

export const clampUsage = (resource: UsageResource, amount: number) =>
  Math.min(resource.max, Math.max(resource.min, Math.round(amount)));

export const resourceCost = (resource: UsageResource, amount: number) =>
  roundMoney(Math.max(0, amount - (resource.freeUnits ?? 0)) * resource.rate);

// ─── Custom plan ─────────────────────────────────────────────────────────────
export interface QuoteLine {
  key: UsageResource["key"];
  label: string;
  amount: number;
  cost: number;
}
export interface Quote {
  lines: QuoteLine[];
  baseFee: number;
  monthly: number;
}

export function quoteCustom(catalog: PricingCatalog, usage: UsageMap): Quote {
  const lines = catalog.resources
    .filter((r) => usage[r.key] > 0)
    .map((r) => ({ key: r.key, label: r.label, amount: usage[r.key], cost: resourceCost(r, usage[r.key]) }));
  const monthly = roundMoney(lines.reduce((sum, l) => sum + l.cost, catalog.baseFee));
  return { lines, baseFee: catalog.baseFee, monthly };
}

export const planCovers = (catalog: PricingCatalog, plan: PricingPlan, usage: UsageMap) =>
  catalog.resources.every((r) => usage[r.key] <= plan.includes[r.key]);

/** The cheapest standard plan whose allowances cover everything in `usage`, if any. */
export const cheapestCoveringPlan = (catalog: PricingCatalog, usage: UsageMap) =>
  [...catalog.plans]
    .sort((a, b) => a.price - b.price)
    .find((plan) => planCovers(catalog, plan, usage)) ?? null;

// ─── Promo codes ─────────────────────────────────────────────────────────────
/** `target` is a plan id or "custom". */
export const promoApplies = (promo: PromoCode, target: string) =>
  promo.appliesTo === "all" || promo.appliesTo.includes(target);

export interface PromoPrice {
  applied: boolean;
  regular: number;
  /** Discounted monthly price while the promo lasts. */
  monthly: number;
  saving: number;
  /** Discounted months; null while the subscription runs. */
  months: number | null;
}

export function applyPromo(regular: number, promo: PromoCode | null, target: string): PromoPrice {
  if (!promo || !promoApplies(promo, target)) {
    return { applied: false, regular, monthly: regular, saving: 0, months: null };
  }
  const off = promo.kind === "percent" ? (regular * promo.value) / 100 : promo.value;
  const monthly = roundMoney(Math.max(0, regular - off));
  return { applied: true, regular, monthly, saving: roundMoney(regular - monthly), months: promo.months };
}

/** What a customer pays across their first 12 months. */
export function firstYearTotal(price: PromoPrice) {
  const discounted = price.months === null ? 12 : Math.min(price.months, 12);
  return roundMoney(price.monthly * discounted + price.regular * (12 - discounted));
}

export const promoDuration = (promo: PromoCode) =>
  promo.months === null
    ? "for as long as you subscribe"
    : promo.months === 1
      ? "on your first month"
      : `for your first ${promo.months} months`;

// ─── Presentation helpers ────────────────────────────────────────────────────
export const resourceGroups: { id: ResourceGroup; title: string }[] = [
  { id: "workspace", title: "Workspace" },
  { id: "meta", title: "Meta ads and signals" },
  { id: "channels", title: "Talking to your operator" },
  { id: "agent", title: "Agent compute" },
  { id: "storage", title: "Storage" },
];

export const groupResources = (catalog: PricingCatalog) =>
  resourceGroups
    .map((group) => ({ ...group, resources: catalog.resources.filter((r) => r.group === group.id) }))
    .filter((group) => group.resources.length > 0);

/** Starting point for the custom plan builder: the plan's allowances, kept inside each slider's range. */
export const usageFromPlan = (catalog: PricingCatalog, plan: PricingPlan): UsageMap => {
  const usage = { ...plan.includes };
  for (const r of catalog.resources) usage[r.key] = clampUsage(r, plan.includes[r.key]);
  return usage;
};

/** Which plans a code covers, or null when it covers everything. */
export function promoScopeLabel(promo: PromoCode, catalog: PricingCatalog) {
  if (promo.appliesTo === "all") return null;
  const names = promo.appliesTo.map((target) =>
    target === "custom" ? "the custom plan" : catalog.plans.find((p) => p.id === target)?.name ?? target,
  );
  return names.join(", ");
}

/** "$0.35 per minute", "$0.10 per 1,000 events", "0.2% of managed spend". */
export function describeRate(resource: UsageResource) {
  const { per, unit, percent } = resource.rateBasis;
  if (percent) return `${Number((resource.rate * 100).toFixed(3))}% of ${unit}`;
  const price = resource.rate * per;
  const text = price < 0.1 ? price.toFixed(price < 0.01 ? 4 : 3).replace(/0+$/, "").replace(/\.$/, "") : price.toFixed(2);
  return `$${text} per ${per > 1 ? `${per.toLocaleString()} ` : ""}${unit}`;
}

// ─── Administrator economics ─────────────────────────────────────────────────
export const unitCostOf = (costs: ResourceCost[], key: UsageResource["key"]) =>
  costs.find((c) => c.key === key)?.unitCost ?? 0;

/** Cost of what is always on for a plan, whether or not it is used (the 24/7 sandbox and shared platform). */
export const planBaseCost = (pricing: AdminPricing, plan: PricingPlan) =>
  roundMoney(pricing.baseCosts.reduce((sum, b) => sum + b.monthlyPerUnit * (b.unitsByPlan[plan.id] ?? 0), 0));

/** Cost of the metered allowances if `utilization` (0 to 1) of each is used. */
export const planUsageCost = (pricing: AdminPricing, plan: PricingPlan, utilization = 1) =>
  roundMoney(
    pricing.catalog.resources
      .filter((r) => r.kind === "usage")
      .reduce((sum, r) => sum + plan.includes[r.key] * unitCostOf(pricing.costs, r.key), 0) * utilization,
  );

export const planCost = (pricing: AdminPricing, plan: PricingPlan, utilization = 1) =>
  roundMoney(planBaseCost(pricing, plan) + planUsageCost(pricing, plan, utilization));

/** Margin as a share of the price: 0.4 means 40% of the price is left after cost. */
export const marginOf = (price: number, cost: number) => (price > 0 ? (price - cost) / price : 0);

/**
 * Share of the metered allowances that can be used before a plan stops making money.
 * Above 1 it always makes money; below 0 the always-on base alone costs more than the price.
 */
export const breakEvenUse = (pricing: AdminPricing, plan: PricingPlan) => {
  const variable = planUsageCost(pricing, plan, 1);
  const room = plan.price - planBaseCost(pricing, plan);
  return variable > 0 ? room / variable : room >= 0 ? Infinity : -Infinity;
};

/** Returns a message for the first problem found, or null when the pricing is safe to publish. */
export function pricingProblem(catalog: PricingCatalog): string | null {
  if (!(catalog.baseFee >= 0)) return "The platform fee can’t be negative.";
  for (const r of catalog.resources) {
    if (!(r.rate >= 0)) return `${r.label}: the rate can’t be negative.`;
  }
  for (const plan of catalog.plans) {
    if (!(plan.price > 0)) return `${plan.name}: the price must be above zero.`;
    for (const r of catalog.resources) {
      const amount = plan.includes[r.key];
      if (!Number.isFinite(amount) || amount < 0) return `${plan.name}: ${r.label} must be zero or more.`;
    }
  }
  return null;
}

const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

/** The failed-payment policy in words, generated from the numbers so copy and billing logic can't drift apart. */
export const lifecycleText = ({ liveAfterFailedPaymentDays: live, backupKeptDays: kept }: PricingCatalog["lifecycle"]) =>
  `If a payment fails, your sandbox stays live for ${days(live)}. After that it is switched off, and its backup is kept for ${days(kept)}.`;
