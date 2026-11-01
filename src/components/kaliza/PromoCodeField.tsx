import { useState, type FormEvent } from "react";
import { Check, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePromoCode } from "@/lib/api";
import { promoDuration, promoScopeLabel } from "@/lib/pricing";
import type { PricingCatalog, PromoCode } from "@/lib/types";

interface Props {
  catalog: PricingCatalog;
  applied: PromoCode | null;
  onApply: (promo: PromoCode) => void;
  onRemove: () => void;
}

export function PromoCodeField({ catalog, applied, onApply, onRemove }: Props) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    setError("");
    try {
      const result = await validatePromoCode(code);
      if (result.valid) {
        onApply(result.promo);
        setCode("");
      } else {
        setError(result.reason);
      }
    } catch {
      setError("We couldn’t check that code. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  }

  if (applied) {
    const scope = promoScopeLabel(applied, catalog);
    return (
      <div role="status" className="flex w-full max-w-md flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm">
        <Check className="size-4 shrink-0 text-success" />
        <div className="min-w-0 flex-1">
          <p>
            <span className="font-semibold">{applied.code}</span> applied: {applied.label} {promoDuration(applied)}.
          </p>
          {scope && <p className="mt-0.5 text-xs text-muted-foreground">Applies to {scope} only.</p>}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <X className="size-3.5" />
          Remove
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <Label htmlFor="promo-code" className="sr-only">
        Promo code
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            id="promo-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Promo code"
            autoComplete="off"
            spellCheck={false}
            className="pl-9 uppercase placeholder:normal-case"
          />
        </div>
        <Button type="submit" variant="outline" disabled={checking || !code.trim()}>
          {checking ? "Checking…" : "Apply code"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {!error && catalog.demoPromoHint && (
        <p className="mt-2 text-xs text-muted-foreground">Demo code: {catalog.demoPromoHint}</p>
      )}
    </form>
  );
}
