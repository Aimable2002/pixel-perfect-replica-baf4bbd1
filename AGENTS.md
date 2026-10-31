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
- All UI data access goes through `src/lib/api.ts`; mock data lives only in `src/lib/mock.ts` so the backend can be swapped by editing api.ts alone.
- Dashboard pages wrap themselves in `AppShell` (sidebar + agent drawer); auth/onboarding pages render without it.

- Public acquisition pages remain outside `_authenticated`; workspace pages require the Cloud session, with a clearly separated signed-out demo tour.
- Application reads and writes, auth subscriptions, and administrator role queries must remain behind `src/lib/api.ts`; only mock.ts owns sample records.
- Administrator access uses protected user_roles and RLS, never browser flags; signed-out admin previews expose sample data only.
- Persist owner workspace documents in workspaces.state until domain tables are introduced; provider delivery must never be inferred from local state changes.
- Agent proposals use reusable ActionCard controls shared by the command center and conversation so owners review actions inline.
