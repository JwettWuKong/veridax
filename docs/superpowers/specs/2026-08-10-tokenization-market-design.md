# VERIDAX Tokenization & Market — Design Spec

**Date:** 2026-08-10
**Status:** Approved, ready for implementation planning
**Phase:** 2 of 4 (Tokenization & Market)

## Background

Phase 1 (`docs/superpowers/specs/2026-08-06-backend-foundation-design.md`) made
accounts, posts, and validation real and shared across users via Supabase.
Tokenization and the knowledge-token market were deliberately left as a
local-only, single-browser simulation at that point (`localTokenData` state in
`App.jsx`, overlaid onto real posts), preserving existing behavior without
regressing it while the rest of the platform became real.

An audit of the current tokenization code (`TokenizeModal`, `BuyModal`) found
it is entirely fake in ways distinct from what Phase 1 fixed:

- `TokenizeModal`'s "community tokenization vote" is seeded with hardcoded
  numbers (1,316 YES / 684 NO) that reset every time the modal opens. A
  single click on YES unilaterally tokenizes the post after a fake delay —
  despite the UI claiming a real 66% community threshold.
- `BuyModal`'s bonding-curve math (`bondingPrice`, `bondingCost`) is genuinely
  correct, real math — but nothing about a purchase persists anywhere real;
  supply/ownership exist only in one browser's local state.
- The five tokenization gates displayed to users are already back by real
  Phase-1 data (`post.up`, cross-cluster validation counts, diversity index,
  trust score) **except one**: the "200 peer citations" gate reads
  `post.cite`, which is hardcoded to `0` for every real post — there is no
  citation mechanism anywhere in the app, real or fake. This means no post
  could ever pass all five gates under the current data model.

## Roadmap (for context — only Phase 2 is designed/scoped here)

1. **Foundation** *(shipped)* — real backend, real auth, shared posts/validation.
2. **Tokenization & Market** *(this spec)* — real tokenization voting, real
   token creation, real purchases and portfolio.
3. **Wallet** — real deposits/withdrawals/transaction history, decide on real
   payment processing.
4. **Category proposals** — real community voting to add new categories.

## Phase 2 Scope

**In scope:**
- Real, shared tokenization voting — a second real voting system (distinct
  from post validation), with a genuine 66% YES threshold and a 100-vote
  quorum, both computed from real per-user vote rows.
- Automatic, server-side token creation the instant a post's real vote count
  crosses that threshold — enforced by a Postgres trigger, not by any
  client's action, so there is no "whose browser is responsible for creating
  it" race condition.
- Real, shared token purchases — supply and portfolio become real numbers
  every user sees consistently, replacing the `localTokenData` overlay.
- `TOKEN_GATES`/`checkGates` (`src/lib/scoring.js`) updated to drop the
  citations gate: eligibility becomes 4 real gates (upvotes, cross-cluster
  validations, diversity index, trust score), not 5.

**Explicitly out of scope for Phase 2** (deferred, unchanged from today):
- Wallet balance — stays unlimited, free, and local-only. Real payment
  processing is Phase 3's job; pulling any part of it forward here was
  explicitly declined.
- A citation mechanism — doesn't exist yet in any form; explicitly deferred
  to a future, not-yet-scoped phase.
- Server-side validation of purchase `cost` against the real bonding-curve
  formula — accepted as client-trusted for now (see Known Trust Boundaries).
- Server-side re-verification that a post actually meets the 4 gates before
  accepting a tokenize vote — accepted as a client-side-only check for now
  (see Known Trust Boundaries).

## Data Model

Three new tables, following the same pattern established in Phase 1:
immutable rows only (no update/delete policy on anything), aggregates always
*derived* from real rows rather than stored as a mutable counter a client
could desync or race on.

### `tokenize_votes`
The real "community vote to tokenize" system, structurally mirroring `votes`.

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `post_id` | `uuid` | `references posts(id)` |
| `user_id` | `uuid` | `references profiles(id)` |
| `vote` | `text` | `check (vote in ('yes','no'))` |
| `created_at` | `timestamptz` | `default now()` |

**Unique constraint on `(post_id, user_id)`** — one tokenize-vote per person
per post, the same real database guarantee Phase 1 established for
validation votes.

### `tokens`
Marks a post as tokenized. Deliberately minimal — no `supply` or `sym`
column.

| column | type | notes |
|---|---|---|
| `post_id` | `uuid` PK | `references posts(id)` |
| `created_at` | `timestamptz` | `default now()` |

Supply is always `1000 + SUM(qty)` from real rows in `token_purchases` —
never a mutable counter. The token symbol (e.g. `⬡ ABX`) is a pure
deterministic function of the post title, computed the same way today's fake
code already computes it (`title.split(" ").slice(0,2).map(w=>w[0]).join("")
+ "X"`) — there is no reason to persist a value that is cheaper and safer to
recompute identically on every client.

### `token_purchases`

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `post_id` | `uuid` | `references tokens(post_id)` |
| `user_id` | `uuid` | `references profiles(id)` |
| `qty` | `integer` | |
| `cost` | `numeric` | client-computed; see Known Trust Boundaries |
| `created_at` | `timestamptz` | `default now()` |

Portfolio for a given user = `SUM(qty)` grouped by `post_id` from their own
rows in this table.

## The Automatic Threshold-Crossing Mechanism

The key new mechanism, and what makes the vote *real* rather than a race
between whichever browser happens to be open when a threshold is crossed: a
Postgres trigger `AFTER INSERT ON tokenize_votes` recomputes the real
`yes`-vote percentage and total-vote count on every single vote cast, and —
entirely server-side, atomically, with no client involved — inserts the
corresponding `tokens` row the instant the threshold is genuinely crossed. No
client ever "creates" a token; every client only ever casts a vote, and the
database alone decides when enough real votes exist.

- **Quorum:** 100 total votes on a post before the percentage threshold is
  even evaluated (prevents a single early vote from trivially "passing" at
  100%).
- **Threshold:** 66% YES, matching the number already shown in the existing
  (currently fake) UI copy.
- The trigger only fires token creation if a `tokens` row for that `post_id`
  does not already exist (idempotent — later votes past threshold are no-ops
  with respect to token creation).

## Security Model (RLS)

Same enable-and-explicit-policy pattern as Phase 1 — RLS must be explicitly
turned on for all three new tables (`ALTER TABLE ... ENABLE ROW LEVEL
SECURITY`) before any policy on them is meaningful; without it, Postgres's
default grants would let the `anon`/`authenticated` roles read and write
freely regardless of which policies exist. No update/delete policy exists on
any of the three tables.

- **`tokenize_votes`, `tokens`, `token_purchases`**: `select` open to
  everyone (including logged-out visitors), so market data and vote tallies
  are visible without an account.
- **`tokenize_votes` insert**: only as yourself (`auth.uid() = user_id`);
  blocked from voting twice by the unique constraint.
- **`tokens` insert**: no RLS insert policy for ordinary users at all — only
  the trigger function can insert here, running with elevated privilege
  (`security definer`, pinned `search_path`, same pattern as Phase 1's
  `handle_new_user` trigger). A client can never fabricate a token directly.
- **`token_purchases` insert**: only as yourself (`auth.uid() = user_id`).

### Known, explicitly accepted trust boundaries

Flagging both honestly rather than glossing over them, consistent with the
purpose of this whole migration:

1. **Gate-eligibility is not re-checked server-side before accepting a
   tokenize vote.** "You can only vote once a post meets all 4 gates" is
   enforced by hiding the vote button client-side — the same trust level as
   most of the rest of the app outside hard security boundaries.
   Reproducing `checkGates`' full logic as a SQL policy would be substantial
   duplicated complexity for a rule that, unlike double-voting or fabricating
   a token, doesn't let anyone steal or fabricate anything: worst case,
   someone votes on an ineligible post, which does nothing, since it will
   never reach the real 100-vote quorum on a post nobody is genuinely
   engaging with.
2. **`token_purchases.cost` is client-computed and trusted**, not verified
   against the real bonding-curve formula server-side. There is no real
   payment processor yet (Phase 3), so there is no real value to protect by
   enforcing this now — it is already exactly as trustworthy as the fake
   wallet balance that pays for it.

## Architecture

Continuing the Phase 1 pattern: direct Supabase client + RLS, extending the
existing `src/lib/` layer.

- `src/lib/tokenizeVotes.js` — `fetchTokenizeVotes()`, `castTokenizeVote()`,
  `aggregateTokenizeVotes()` (pure, unit-tested — mirrors `votes.js`'s shape
  exactly).
- `src/lib/market.js` — `fetchTokens()`, `fetchPurchases()`, `buyToken()`,
  `aggregateMarket()` (pure, unit-tested — derives supply-per-post and
  portfolio-per-user from purchase rows).
- `src/lib/scoring.js` — `TOKEN_GATES`/`checkGates` modified to drop the
  citations gate (`metCount === 4` for `allMet`, not `5`); existing test
  suite updated to match.

## UI / Flow Changes

- **`TokenizeModal`**: real YES/NO buttons insert a real `tokenize_votes` row
  via `castTokenizeVote` (same async/error-handling pattern established for
  `ValidationModal` in Phase 1). Vote tallies shown are the real aggregated
  counts, not the hardcoded 1,316/684 seed. If the vote just cast happens to
  be the one crossing threshold, the trigger has already created the token
  server-side by the time the insert call returns; the UI re-fetches and
  reflects the post as tokenized. If it doesn't cross threshold, the user
  just sees their vote recorded, the same as validation.
- **`BuyModal`**: a real purchase inserts into `token_purchases`. Still
  deducts from the local fake wallet balance exactly as today — no real
  payment, unchanged. The bonding-curve math itself is unchanged (it was
  already correct).
- **`DashboardSidebar`'s Portfolio tab**: reads real portfolio data
  (aggregated from `token_purchases`) instead of local `portfolio` state —
  the one place local wallet-adjacent state is replaced with real data in
  this phase.
- **Market page / token list**: reads real `tokens` plus derived supply,
  instead of the `localTokenData` overlay Phase 1 introduced as a stopgap.
  That overlay is removed entirely now that real data exists.

## Rollout

- SQL migration `supabase/migrations/0002_tokenization.sql`: the three
  tables, RLS enabled + policies on each, the auto-tokenize trigger — run
  manually in the Supabase SQL editor, same process as Phase 1's migration.
- No existing production token/purchase data exists to migrate (Phase 1
  shipped with `localTokenData` as a per-browser stopgap only) — this is a
  clean, additive schema change.

## Testing

- Unit tests (Vitest) for `aggregateTokenizeVotes` and `aggregateMarket`
  (pure functions), plus updated tests for `checkGates` reflecting the
  4-gate change.
- Manual QA: crossing a real 100-vote quorum isn't practical to test one
  click at a time by hand. A throwaway script will cast many votes as
  distinct synthetic test users to prove the trigger genuinely fires at the
  real threshold server-side; the resulting tokenized post and market UI are
  then verified live, alongside a real two-user buy/portfolio check
  following the same pattern as Phase 1's end-to-end QA.

## Explicitly deferred (not this phase)

- Real wallet balance, deposits, withdrawals, real payment processing
  (Phase 3)
- Citation tracking mechanism (future, not yet scoped)
- Server-side enforcement of gate-eligibility before a tokenize vote is
  accepted, and server-side validation of purchase cost against the bonding
  curve (both explicitly accepted trust boundaries above — revisit if/when
  Phase 3 introduces real money)
- Category proposals (Phase 4)
