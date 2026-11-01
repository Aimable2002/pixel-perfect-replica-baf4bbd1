import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { PublicShell } from "@/components/kaliza/PublicShell";
import { CardSkeletons, EmptyState } from "@/components/kaliza/common";
import { CustomPlanCard } from "@/components/kaliza/CustomPlanCard";
import { PlanCard } from "@/components/kaliza/PlanCard";
import { PromoCodeField } from "@/components/kaliza/PromoCodeField";
import { UsageCatalog } from "@/components/kaliza/UsageCatalog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getPricingCatalog, saveCheckoutIntent } from "@/lib/api";
import { pageHead } from "@/lib/page-head";
import { promoApplies } from "@/lib/pricing";
import type { CheckoutIntent, PricingPlan, PromoCode, UsageMap } from "@/lib/types";

export const Route = createFileRoute("/pricing")({
  head: () => pageHead("Pricing", "Compare Starter, Pro, Scale and Agency plans, or build a custom plan around your own usage."),
  component: Pricing,
});

function Pricing() {
  const navigate = useNavigate();
  const { data: catalog, isLoading, isError, refetch } = useQuery({ queryKey: ["pricing-catalog"], queryFn: getPricingCatalog });
  const [annual, setAnnual] = useState(false);
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [contact, setContact] = useState(false);
  const [sent, setSent] = useState(false);

  const promoFor = (target: string) => (promo && promoApplies(promo, target) ? { promoCode: promo.code } : {});

  async function startCheckout(intent: Omit<CheckoutIntent, "savedAt">) {
    try {
      await saveCheckoutIntent(intent);
    } catch {
      // The choice just isn't remembered; sign-up still goes ahead.
    }
    await navigate({ to: "/signup" });
  }

  const choosePlan = (plan: PricingPlan) =>
    startCheckout({ kind: "plan", planId: plan.id, monthlyPrice: plan.price, ...promoFor(plan.id) });

  const chooseCustom = (usage: UsageMap, monthlyPrice: number) =>
    startCheckout({ kind: "custom", usage, monthlyPrice, ...promoFor("custom") });

  return (
    <PublicShell>
      <main className="mx-auto max-w-7xl px-6 py-14">
        <p className="hud-label">An operator for every stage</p>
        <h1 className="mt-5 text-4xl font-semibold md:text-5xl">Kaliza pricing.</h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every feature is on every plan. Plans differ only in how much your operator can use each month, and each allowance is listed below. Proposed pricing; checkout is not activated.
        </p>

        <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={!annual ? "default" : "outline"} onClick={() => setAnnual(false)}>Monthly</Button>
            <Button variant={annual ? "default" : "outline"} onClick={() => setAnnual(true)}>Annual</Button>
          </div>
          {catalog && (
            <PromoCodeField catalog={catalog} applied={promo} onApply={setPromo} onRemove={() => setPromo(null)} />
          )}
        </div>

        {isLoading && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <CardSkeletons count={4} className="h-[34rem]" />
          </div>
        )}

        {isError && (
          <div className="mt-8">
            <EmptyState title="Pricing isn’t loading" body="Check your connection and try again." />
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        )}

        {catalog && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {catalog.plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} catalog={catalog} annual={annual} promo={promo} onChoose={choosePlan} />
              ))}
            </div>

            <div className="mt-8">
              <CustomPlanCard catalog={catalog} annual={annual} promo={promo} onChoose={chooseCustom} onChoosePlan={choosePlan} />
            </div>

            <UsageCatalog catalog={catalog} />
          </>
        )}

        <section className="mt-12 flex flex-wrap items-center justify-between gap-5 border-y py-8">
          <div>
            <h2 className="text-xl font-semibold">Something bigger in mind?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Let’s scope your requirements before committing.</p>
          </div>
          <Button variant="outline" onClick={() => setContact(true)}>
            Enterprise inquiry
            <ArrowUpRight className="size-4" />
          </Button>
        </section>

        <Dialog open={contact} onOpenChange={setContact}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enterprise inquiry</DialogTitle>
            </DialogHeader>
            {sent ? (
              <p className="text-sm text-muted-foreground">
                Your inquiry is prepared locally. Contact delivery is not connected yet; no email has been sent.
              </p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Input type="email" placeholder="Work email" aria-label="Work email" required />
                <Input placeholder="Company" aria-label="Company" required />
                <Input placeholder="Number of brands" aria-label="Number of brands" type="number" min={1} />
                <Button className="w-full">Prepare inquiry</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </PublicShell>
  );
}
