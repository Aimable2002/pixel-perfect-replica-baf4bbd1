<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All UI data access goes through `src/lib/api.ts`. Domain reads and writes delegate to one `DataSource` (`src/lib/datasource.ts`), currently `mockSource` (`src/lib/mock-source.ts`, seeded from `src/lib/mock.ts`). To go live, implement `DataSource` against the backend, change the one `source` line in api.ts, and delete mock.ts, mock-source.ts and `src/test/mock-catalog.test.ts`. Sign-in, the workspace row and admin roles stay in api.ts (Supabase).
- Dashboard pages wrap themselves in `AppShell` (sidebar + agent drawer); auth/onboarding pages render without it.

- Public acquisition pages remain outside `_authenticated`; workspace pages require the Cloud session, with a clearly separated signed-out demo tour.
- Application reads and writes, auth subscriptions, and administrator role queries must remain behind `src/lib/api.ts`; only mock.ts owns sample records.
- Administrator access uses protected user_roles and RLS, never browser flags; signed-out admin previews expose sample data only.
- Domain data is sample data served by `mockSource` and held in memory (it resets on reload); provider delivery must never be inferred from local state changes. Brand and preferences still persist in workspaces.state.
- Pricing: plans differ only by allowance; every feature is on every plan. Each customer's sandbox runs 24/7 and is backed up on every plan, so its cost is a fixed base. Only agent requests, voice minutes and storage are metered. A failed payment keeps the sandbox live for `lifecycle.liveAfterFailedPaymentDays` days, then its backup is kept `backupKeptDays` days.
- Provider costs are admin-only (`getAdminPricing`) and must never appear in the public `getPricingCatalog` response. Retail prices and allowances are edited in Admin > Pricing.
- Pure pricing maths lives in `src/lib/pricing.ts` and takes the catalog as an argument, so it survives deleting the mock.
- Agent proposals use reusable ActionCard controls shared by the command center and conversation so owners review actions inline.
