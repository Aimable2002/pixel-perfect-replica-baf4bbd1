import { describe, expect, it } from "vitest";
import {
  applyPromo, breakEvenUse, cheapestCoveringPlan, describeRate, firstYearTotal, formatQuantity, lifecycleText,
  marginOf, planBaseCost, planCost, pricingProblem, promoApplies, quoteCustom,
} from "@/lib/pricing";
import type { AdminPricing, PricingCatalog, PromoCode, UsageResource } from "@/lib/types";

// A tiny catalog of our own, so these tests keep working after mock.ts is deleted.
const resource = (over: Partial<UsageResource> & Pick<UsageResource, "key">): UsageResource => ({
  label: over.key, group: "workspace", provider: "Test", summary: "", counts: "",
  kind: "usage", suffix: "", min: 0, max: 1000, step: 1, rate: 1, rateBasis: { per: 1, unit: "unit" }, ...over,
});
const none = { brands: 0, seats: 0, adSpend: 0, conversionEvents: 0, agentRequests: 0, voiceMinutes: 0, storageGb: 0 };
const catalog: PricingCatalog = {
  currency: "USD", baseFee: 10, alwaysIncluded: [], guarantees: [], overagePolicy: "",
  lifecycle: { liveAfterFailedPaymentDays: 7, backupKeptDays: 30 },
  resources: [
    resource({ key: "seats", rate: 5, freeUnits: 1, suffix: " seats", singular: " seat" }),
    resource({ key: "voiceMinutes", rate: 0.1, suffix: " min" }),
    resource({ key: "adSpend", rate: 0.01, prefix: "$", suffix: "" }),
  ],
  plans: [
    { id: "small", name: "Small", price: 50, tagline: "", features: [], includes: { ...none, seats: 1, voiceMinutes: 100, adSpend: 1000 } },
    { id: "big", name: "Big", price: 120, tagline: "", features: [], includes: { ...none, seats: 5, voiceMinutes: 500, adSpend: 5000 } },
  ],
};
const seatsRes = catalog.resources[0]!;

describe("formatQuantity", () => {
  it("handles prefix, suffix and singular", () => {
    expect(formatQuantity(seatsRes, 1)).toBe("1 seat");
    expect(formatQuantity(seatsRes, 3)).toBe("3 seats");
    expect(formatQuantity(catalog.resources[2]!, 10000)).toBe("$10,000");
  });
});

describe("custom plan quote", () => {
  it("adds the platform fee and skips free units", () => {
    const quote = quoteCustom(catalog, { ...none, seats: 3, voiceMinutes: 200, adSpend: 1000 });
    // 10 fee + (3-1)*5 seats + 200*0.1 voice + 1000*0.01 ads
    expect(quote.monthly).toBe(10 + 10 + 20 + 10);
  });

  it("recommends the cheapest plan that covers the usage, or none", () => {
    expect(cheapestCoveringPlan(catalog, { ...none, voiceMinutes: 80 })?.id).toBe("small");
    expect(cheapestCoveringPlan(catalog, { ...none, voiceMinutes: 101 })?.id).toBe("big");
    expect(cheapestCoveringPlan(catalog, { ...none, voiceMinutes: 501 })).toBeNull();
  });
});

describe("promo codes", () => {
  const percent: PromoCode = { code: "P", label: "25% off", kind: "percent", value: 25, months: 3, appliesTo: "all" };
  const amount: PromoCode = { code: "A", label: "$20 off", kind: "amount", value: 20, months: 1, appliesTo: ["pro"] };

  it("applies only to the plans it covers", () => {
    expect(promoApplies(percent, "custom")).toBe(true);
    expect(promoApplies(amount, "pro")).toBe(true);
    expect(promoApplies(amount, "starter")).toBe(false);
    expect(applyPromo(79, amount, "starter").applied).toBe(false);
  });

  it("discounts by percent or amount and never goes below zero", () => {
    expect(applyPromo(149, percent, "pro").monthly).toBe(111.75);
    expect(applyPromo(15, amount, "pro").monthly).toBe(0);
  });

  it("totals the first year with a limited-time discount", () => {
    // 3 months at 111.75, then 9 at 149
    expect(firstYearTotal(applyPromo(149, percent, "pro"))).toBe(111.75 * 3 + 149 * 9);
    expect(firstYearTotal(applyPromo(149, null, "pro"))).toBe(149 * 12);
  });
});

describe("rates and policy wording", () => {
  it("describes a rate the way customers read it", () => {
    expect(describeRate(resource({ key: "voiceMinutes", rate: 0.28, rateBasis: { per: 1, unit: "minute" } }))).toBe("$0.28 per minute");
    expect(describeRate(resource({ key: "conversionEvents", rate: 0.0001, rateBasis: { per: 1000, unit: "events" } }))).toBe("$0.10 per 1,000 events");
    expect(describeRate(resource({ key: "adSpend", rate: 0.001, rateBasis: { per: 1, unit: "managed spend", percent: true } }))).toBe("0.1% of managed spend");
  });

  it("states the failed-payment policy from its numbers", () => {
    expect(lifecycleText({ liveAfterFailedPaymentDays: 7, backupKeptDays: 30 })).toBe(
      "If a payment fails, your sandbox stays live for 7 days. After that it is switched off, and its backup is kept for 30 days.",
    );
    expect(lifecycleText({ liveAfterFailedPaymentDays: 1, backupKeptDays: 1 })).toContain("1 day.");
  });
});

describe("plan economics", () => {
  // Always-on base of $50 per account, then $0.10 per voice minute.
  const admin: AdminPricing = {
    catalog,
    costsCheckedOn: "2026-10-31",
    baseCosts: [{ id: "sandbox", label: "Sandbox", monthlyPerUnit: 50, unitsByPlan: { small: 1, big: 2 }, basis: "", source: "" }],
    costs: [{ key: "voiceMinutes", unitCost: 0.1, costLabel: "", basis: "", source: "" }],
  };
  const [small, big] = catalog.plans as [(typeof catalog.plans)[number], (typeof catalog.plans)[number]];

  it("counts the always-on base whether or not anything is used", () => {
    expect(planBaseCost(admin, small)).toBe(50);
    expect(planBaseCost(admin, big)).toBe(100);
    expect(planCost(admin, small, 0)).toBe(50);
  });

  it("adds metered cost in proportion to use", () => {
    // small: 100 voice min x $0.10 = $10 at full use
    expect(planCost(admin, small, 1)).toBe(60);
    expect(planCost(admin, small, 0.5)).toBe(55);
  });

  it("computes margin and break-even use", () => {
    expect(marginOf(80, 60)).toBeCloseTo(0.25);
    // small price $50, base $50, nothing left for usage: break-even at 0% use
    expect(breakEvenUse(admin, small)).toBe(0);
    // big price $120, base $100, $20 of room against $50 of full-use voice cost
    expect(breakEvenUse(admin, big)).toBeCloseTo(0.4);
  });

  it("refuses prices that would break the catalog", () => {
    expect(pricingProblem(catalog)).toBeNull();
    expect(pricingProblem({ ...catalog, baseFee: -1 })).toMatch(/negative/);
    const free = structuredClone(catalog);
    free.plans[0]!.price = 0;
    expect(pricingProblem(free)).toMatch(/above zero/);
  });
});
