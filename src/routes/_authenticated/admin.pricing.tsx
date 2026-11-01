import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/kaliza/AdminConsole";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => pageHead("Platform pricing", "Kaliza platform administration: retail prices, allowances and provider costs."),
  component: () => <AdminConsole view="Pricing" />,
});
