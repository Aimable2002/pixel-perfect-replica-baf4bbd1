import { applyPromo, firstYearTotal, promoDuration, usd } from "@/lib/pricing";
import type { PromoCode } from "@/lib/types";

interface Props {
  /** Regular monthly price before any promo. */
  regular: number;
  /** Plan id or "custom": decides whether the promo applies. */
  target: string;
  promo: PromoCode | null;
  annual: boolean;
}

export function PriceBlock({ regular, target, promo, annual }: Props) {
  const price = applyPromo(regular, promo, target);
  const shown = annual ? firstYearTotal(price) : price.monthly;
  const crossedOut = annual ? regular * 12 : regular;
  const period = annual ? (price.applied && price.months !== null ? "first year" : "year") : "month";

  let caption = annual ? "Annual estimate: 12 monthly payments." : "";
  if (promo && price.applied) {
    caption = `${promo.label} ${promoDuration(promo)}${promo.months === null ? "" : `, then ${usd(regular)}/month`}.`;
  } else if (promo) {
    caption = `${promo.code} doesn’t apply to this plan.`;
  }

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-semibold">{usd(shown)}</span>
        <span className="text-xs text-muted-foreground">/{period}</span>
        {price.applied && price.saving > 0 && (
          <s className="text-sm text-muted-foreground" aria-label={`Regular price ${usd(crossedOut)}`}>
            {usd(crossedOut)}
          </s>
        )}
      </p>
      <p className="mt-2 min-h-8 text-xs text-muted-foreground">{caption}</p>
    </div>
  );
}
