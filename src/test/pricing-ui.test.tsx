import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomPlanCard } from "@/components/kaliza/CustomPlanCard";
import { PromoCodeField } from "@/components/kaliza/PromoCodeField";
import { mockSource } from "@/lib/mock-source";
import type { PromoCode } from "@/lib/types";

const catalog = await mockSource.getPricingCatalog();

describe("PromoCodeField", () => {
  it("applies a valid code and shows what it does", async () => {
    const onApply = vi.fn();
    render(<PromoCodeField catalog={catalog} applied={null} onApply={onApply} onRemove={() => {}} />);
    fireEvent.change(screen.getByLabelText("Promo code"), { target: { value: "founder50" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply code" }));
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect((onApply.mock.calls[0]?.[0] as PromoCode).code).toBe("FOUNDER50");
  });

  it("explains why an unknown code failed", async () => {
    render(<PromoCodeField catalog={catalog} applied={null} onApply={() => {}} onRemove={() => {}} />);
    fireEvent.change(screen.getByLabelText("Promo code"), { target: { value: "nothing" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/recognise/);
  });

  it("states when a code covers only some plans", () => {
    const agency = catalog.plans.find((p) => p.id === "agency");
    const promo: PromoCode = { code: "AGENCY10", label: "10% off", kind: "percent", value: 10, months: null, appliesTo: ["agency"] };
    render(<PromoCodeField catalog={catalog} applied={promo} onApply={() => {}} onRemove={() => {}} />);
    expect(screen.getByRole("status")).toHaveTextContent(`Applies to ${agency?.name} only`);
  });
});

describe("CustomPlanCard", () => {
  it("starts from the popular plan and lets a plan preset reset every field", () => {
    const onChoose = vi.fn();
    render(<CustomPlanCard catalog={catalog} annual={false} promo={null} onChoose={onChoose} onChoosePlan={() => {}} />);
    const voice = screen.getByLabelText("Real-time voice") as HTMLInputElement;
    expect(voice.value).toBe("300");

    fireEvent.change(voice, { target: { value: "9999999" } });
    expect(voice.value).toBe("5000"); // clamped to the slider maximum

    fireEvent.click(screen.getByRole("button", { name: "Starter" }));
    expect((screen.getByLabelText("Real-time voice") as HTMLInputElement).value).toBe("100");
  });

  it("suggests a cheaper standard plan when one covers the usage", () => {
    render(<CustomPlanCard catalog={catalog} annual={false} promo={null} onChoose={() => {}} onChoosePlan={() => {}} />);
    expect(screen.getByText(/already covers this for/)).toBeInTheDocument();
  });

  it("sends the chosen usage and monthly price", () => {
    const onChoose = vi.fn();
    render(<CustomPlanCard catalog={catalog} annual={false} promo={null} onChoose={onChoose} onChoosePlan={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Choose custom plan/ }));
    expect(onChoose).toHaveBeenCalledOnce();
    expect(onChoose.mock.calls[0]?.[0]).toMatchObject({ voiceMinutes: 300 });
    expect(onChoose.mock.calls[0]?.[1]).toBeGreaterThan(0);
  });
});
