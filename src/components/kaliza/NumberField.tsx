import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Rendered inside the box before the number, e.g. "$". */
  prefix?: string | undefined;
  className?: string | undefined;
  invalid?: boolean | undefined;
}

/** Number box that lets people type freely (including decimals) and reports each valid number. */
export function NumberField({ value, onChange, label, prefix, className, invalid }: Props) {
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className={cn("relative", className)}>
      {prefix && <span className="pointer-events-none absolute left-2.5 top-2 text-xs text-muted-foreground">{prefix}</span>}
      <Input
        aria-label={label}
        aria-invalid={invalid || undefined}
        inputMode="decimal"
        className={cn("h-8 px-2 text-xs", prefix && "pl-5")}
        value={draft !== null && Number(draft.replace(/,/g, "")) === value ? draft : String(value)}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value.replace(/,/g, ""));
          if (e.target.value.trim() !== "" && Number.isFinite(n)) onChange(n);
        }}
        onBlur={() => setDraft(null)}
      />
    </div>
  );
}
