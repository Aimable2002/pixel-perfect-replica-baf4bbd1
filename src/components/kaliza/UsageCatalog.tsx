import { Fragment } from "react";
import { describeRate, formatQuantity, groupResources, lifecycleText } from "@/lib/pricing";
import type { PricingCatalog } from "@/lib/types";

/** Defines every metered resource: who provides it, what is counted, and what each plan includes. */
export function UsageCatalog({ catalog }: { catalog: PricingCatalog }) {
  const groups = groupResources(catalog);

  return (
    <section aria-labelledby="usage-catalog-title" className="mt-16">
      <h2 id="usage-catalog-title" className="text-2xl font-semibold">Everything we meter, in plain terms.</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Every feature is on every plan. Plans differ only in how much of each service your operator can use. This is the full list, with who provides each one and exactly what is counted. The same list drives your Billing and usage page.
      </p>

      <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {catalog.guarantees.map((g) => (
          <li key={g.title} className="border-t pt-4">
            <h3 className="text-sm font-semibold">{g.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{g.body}</p>
          </li>
        ))}
        <li className="border-t pt-4">
          <h3 className="text-sm font-semibold">If a payment fails</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{lifecycleText(catalog.lifecycle)}</p>
        </li>
      </ul>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[60rem] text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th scope="col" className="py-3 pr-6 font-medium">What is metered</th>
              {catalog.plans.map((plan) => (
                <th key={plan.id} scope="col" className="py-3 pr-4 font-medium">{plan.name}</th>
              ))}
              <th scope="col" className="py-3 font-medium">Custom plan rate</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.id}>
                <tr>
                  <th scope="colgroup" colSpan={catalog.plans.length + 2} className="pb-2 pt-8 text-xs font-semibold">
                    {group.title}
                  </th>
                </tr>
                {group.resources.map((r) => (
                  <tr key={r.key} className="border-b align-top">
                    <th scope="row" className="max-w-md py-4 pr-6 font-normal">
                      <span className="block font-medium">{r.label}</span>
                      <span className="block text-xs text-muted-foreground">Delivered by {r.provider}</span>
                      <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{r.counts}</span>
                    </th>
                    {catalog.plans.map((plan) => (
                      <td key={plan.id} className="whitespace-nowrap py-4 pr-4 text-xs">
                        {plan.includes[r.key] ? formatQuantity(r, plan.includes[r.key]) : <span className="text-muted-foreground">None</span>}
                      </td>
                    ))}
                    <td className="py-4 text-xs text-muted-foreground">{describeRate(r)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-t pt-5">
          <h3 className="font-semibold">Always included, never metered</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {catalog.alwaysIncluded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="border-t pt-5">
          <h3 className="font-semibold">When you reach an allowance</h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{catalog.overagePolicy}</p>
        </div>
      </div>
    </section>
  );
}
