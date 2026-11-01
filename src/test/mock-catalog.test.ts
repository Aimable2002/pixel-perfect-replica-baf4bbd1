// Tests for the sample data. Delete this file together with mock.ts and mock-source.ts.
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockSource } from "@/lib/mock-source";
import { breakEvenUse, planBaseCost } from "@/lib/pricing";

afterEach(() => vi.useRealTimers());

describe("sample pricing catalog", () => {
  it("keeps the four discussed monthly prices", async () => {
    const { plans } = await mockSource.getPricingCatalog();
    expect(plans.map((p) => p.price)).toEqual([79, 149, 299, 599]);
  });

  it("defines an allowance for every metered resource on every plan", async () => {
    const { plans, resources } = await mockSource.getPricingCatalog();
    for (const plan of plans) {
      for (const r of resources) expect(plan.includes[r.key], `${plan.name} / ${r.key}`).toBeTypeOf("number");
    }
  });

  it("does not gate features by plan", async () => {
    const { plans } = await mockSource.getPricingCatalog();
    const first = plans[0]?.features;
    for (const plan of plans) expect(plan.features).toEqual(first);
    for (const plan of plans) expect(plan.includes.conversionEvents).toBeGreaterThan(0);
  });

  it("reports usage against the limits of the current plan", async () => {
    const snapshot = await mockSource.getUsageSnapshot();
    const { plans } = await mockSource.getPricingCatalog();
    expect(snapshot.limits).toEqual(plans.find((p) => p.id === snapshot.planId)?.includes);
  });
});

describe("sample promo validation", () => {
  it("accepts a live code in any case", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T12:00:00Z"));
    const result = await mockSource.validatePromoCode("  launch25 ");
    expect(result.valid).toBe(true);
  });

  it("rejects unknown, empty and expired codes with a reason", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-31T12:00:00Z"));
    for (const code of ["NOPE", "", "SUMMER26"]) {
      const result = await mockSource.validatePromoCode(code);
      expect(result.valid).toBe(false);
      if (!result.valid) expect(result.reason.length).toBeGreaterThan(5);
    }
  });
});

describe("sample admin pricing", () => {
  it("keeps costs out of the public catalog", async () => {
    const publicCatalog = JSON.stringify(await mockSource.getPricingCatalog());
    expect(publicCatalog).not.toContain("unitCost");
    expect(publicCatalog).not.toContain("monthlyPerUnit");
  });

  it("counts the always-on sandbox as the base of every plan", async () => {
    const admin = await mockSource.getAdminPricing();
    for (const plan of admin.catalog.plans) expect(planBaseCost(admin, plan)).toBeGreaterThan(0);
  });

  it("retails every metered resource above what it costs us", async () => {
    const admin = await mockSource.getAdminPricing();
    for (const r of admin.catalog.resources.filter((x) => x.kind === "usage")) {
      const cost = admin.costs.find((c) => c.key === r.key)?.unitCost;
      expect(cost, r.key).toBeTypeOf("number");
      expect(r.rate, r.key).toBeGreaterThan(cost ?? 0);
    }
  });

  it("sizes no plan so that its always-on base alone exceeds its price", async () => {
    const admin = await mockSource.getAdminPricing();
    for (const plan of admin.catalog.plans) expect(breakEvenUse(admin, plan), plan.name).toBeGreaterThanOrEqual(0);
  });

  it("publishes an administrator's change to the public page and rejects bad prices", async () => {
    const admin = await mockSource.getAdminPricing();
    const edited = structuredClone(admin);
    edited.catalog.plans[1]!.price = 159;
    await mockSource.saveAdminPricing(edited);
    expect((await mockSource.getPricingCatalog()).plans[1]?.price).toBe(159);

    const broken = structuredClone(edited);
    broken.catalog.plans[1]!.price = -5;
    await expect(mockSource.saveAdminPricing(broken)).rejects.toThrow(/above zero/);
    expect((await mockSource.getPricingCatalog()).plans[1]?.price).toBe(159);

    await mockSource.saveAdminPricing(admin); // restore for other tests
  });

  it("reports the policy for a failed payment", async () => {
    const { lifecycle } = await mockSource.getPricingCatalog();
    expect(lifecycle).toEqual({ liveAfterFailedPaymentDays: 7, backupKeptDays: 30 });
  });
});
