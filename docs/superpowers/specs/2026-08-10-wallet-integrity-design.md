# VERIDAX Wallet Integrity — Design Spec

**Date:** 2026-08-10
**Status:** Approved, ready for implementation planning
**Phase:** 3 of the roadmap (Wallet Integrity)

## Background

Phase 1 made accounts, posts, and validation real and shared. Phase 2 made
tokenization voting and the token market real and shared, while deliberately
leaving wallet balance as unlimited, free, local-only play money.

An audit of the current wallet code (`balance`/`transactions` state in
`App.jsx`) found two things:

- `balance` and `transactions` are pure `useState` + localStorage
  (`vdx_balance`, `vdx_transactions`) — entirely per-browser. "Deposit"
  instantly credits any amount with no processor involved at all; this is
  intentional and stays that way in this phase.
- **A real, previously unflagged bug**: the app prominently claims, in
  multiple places (`TokenizeModal`, `BuyModal`, the Market page, the
  Consensus page), that "the author earns a commission on every
  purchase — automatically and forever," "auto-routed." `handleBuyToken`
  deducts the buyer's balance but **never credits the author anything,
  anywhere**. This claim is currently 100% fake on every single purchase.

Separately, the app has a real, already-working PayPal Hosted Button
donation flow (`DonateSection`) for one-time contributions to the platform
operator. This is unrelated to the wallet and needs no changes.

## Roadmap (for context — only this phase is designed/scoped here)

1. **Foundation** *(shipped)* — real backend, real auth, shared posts/validation.
2. **Tokenization & Market** *(shipped)* — real tokenization voting, real
   token creation, real purchases and portfolio.
3. **Wallet Integrity** *(this spec)* — shared, real (but still play-money)
   balance; real commission routing between users; honest UI claims.
4. **Real Payments** *(future, not yet scoped)* — an actual payment
   processor (e.g. Stripe/PayPal) for real deposits/withdrawals, real
   payouts to authors, and the legal/compliance work that comes with
   handling real currency (money transmission, KYC, chargebacks, tax
   reporting). Deliberately not attempted in this phase.
5. **Category proposals** — real community voting to add new categories.

## Phase 3 Scope

**In scope:**
- `balance` and transaction history move from per-browser localStorage to a
  real, shared ledger in Supabase — still play money (deposits/withdrawals
  remain instant, free, and unlimited; no real payment processor), but one
  true number every device agrees on, the same kind of shift Phase 1 made
  for accounts.
- Real commission routing: buying tokens genuinely, atomically debits the
  buyer and credits the token's author — fixing the previously-fake claim.
- Wallet data (balance, transaction history) is **private per-user** — a
  deliberate exception to the public-by-default pattern established in
  Phases 1–2, since deposit/withdrawal amounts are more sensitive than vote
  counts or purchase quantities.

**Explicitly out of scope for this phase** (deferred to Phase 4 — Real
Payments, not yet scoped):
- Any real payment processor charging real money.
- Real payouts to authors, KYC, tax reporting (e.g. 1099s).
- Overdraft prevention on withdrawals (see Known Trust Boundaries).
- The existing PayPal donation button — real, working, untouched.
- Category proposals (unchanged, still later).

## Data Model

Following the same pattern established in Phases 1–2: immutable rows only,
aggregates always *derived* from real rows.

### `wallet_transactions`

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `user_id` | `uuid` | `references profiles(id)` |
| `type` | `text` | `check (type in ('deposit','withdraw','buy','commission'))` |
| `amount` | `numeric` | positive for deposit/commission, negative for withdraw/buy; sign enforced by a check constraint |
| `method` | `text` | nullable — only meaningful for `deposit` rows (e.g. "Credit Card"), free text same as today's UI |
| `purchase_id` | `uuid` | nullable, `references token_purchases(id)` — set only on `buy`/`commission` rows |
| `created_at` | `timestamptz` | `default now()` |

Balance for a user = `SUM(amount)` over their own rows — never stored as a
mutable counter.

No `desc`/`description` column: display strings like "Bought 10 × ABX" or
"Commission from 'Post Title'" are reconstructed client-side by joining
`purchase_id → token_purchases → posts`, all of which is already loaded in
`App.jsx`. Only `method` is genuinely free-form input with nothing to
derive it from, so it's the one thing actually persisted as text.

### `token_purchases` (existing table, one new column)

- `commission numeric not null default 0 check (commission >= 0)` — the
  dollar amount of commission for this specific purchase, computed
  client-side exactly as the existing BuyModal display already computes it
  (`cost * token.commission / 100`), now persisted instead of thrown away.
- New check constraint: `check (commission <= cost)` — a cheap integrity
  guard so a purchase can never claim to route more commission than the
  purchase itself was worth.

## The Commission-Crediting Mechanism

The client's purchase flow is **unchanged** — `buyToken()` still only
inserts one row into `token_purchases` (now including `commission`). A new
trigger `AFTER INSERT ON token_purchases` does the rest, atomically,
entirely server-side:

1. Inserts the buyer's debit row (`type: 'buy', amount: -cost`).
2. Looks up `posts.author_id` for the purchased post.
3. If `commission > 0`, inserts the author's credit row
   (`type: 'commission', amount: +commission`).

The client never touches another user's balance, and never even directly
inserts its own `buy` debit row — both happen as one guaranteed atomic side
effect of the purchase insert. This mirrors Phase 2's auto-tokenization
trigger exactly: a client action (vote / purchase) triggers a server-side,
`security definer`, atomic consequence that no client can fake or skip.

## Security Model (RLS)

Same enable-and-explicit-policy requirement as Phases 1–2 — RLS must be
explicitly turned on (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) before
any policy on `wallet_transactions` is meaningful.

- **`select`**: private — `using (auth.uid() = user_id)`. You only ever see
  your own balance and transaction history.
- **`insert`**: `with check (auth.uid() = user_id and type in ('deposit',
  'withdraw'))`. You can self-insert your own deposit/withdraw rows only.
  You **cannot** insert a `'buy'` or `'commission'` row yourself — the
  policy's `type in (...)` structurally excludes both. Only the `security
  definer` trigger (running as the table owner, bypassing RLS, same as
  Phase 2's token-creation trigger) can ever create either, which
  guarantees every `buy`/`commission` row traces back to a real purchase —
  no client can fabricate a debit or credit disconnected from an actual
  `token_purchases` row.
- **No update/delete policy** on `wallet_transactions` — immutable rows
  only, matching every other table so far.
- **No policy change needed on `token_purchases`** — its existing "insert
  your own purchase" policy already covers the new `commission` column as
  part of the same row.

### Known, explicitly accepted trust boundaries

Continuing (not expanding) what Phase 2 already accepted:

1. **`commission` is client-computed and trusted**, same as `cost` already
   is. The `commission <= cost` check bounds the worst case. The real
   ceiling on this risk is that deposits are already unlimited fake money
   by design (unchanged from Phase 2) — nobody gains anything by inflating
   commission that they couldn't already get by depositing more directly.
   This isn't a new hole; it's the same already-accepted one, reachable via
   a second door.
2. **Withdrawals aren't checked against current balance server-side.** A
   user could self-insert a withdrawal larger than their real balance,
   going negative. Left unenforced deliberately: since deposits are already
   free and unlimited, blocking overdraft protects nothing real — it would
   only add a `security definer` function for a guarantee that doesn't
   matter while this is still play money with no real value at stake.

## Architecture

Continuing the established pattern: direct Supabase client + RLS, extending
`src/lib/`.

- `src/lib/wallet.js` (new) — `fetchWalletTransactions()` (own rows only,
  RLS-scoped, ordered newest-first), `depositFunds({amount, method})`,
  `withdrawFunds({amount})` (thin, untested wrappers, per convention), plus
  `aggregateWallet(transactions)` — pure, unit-tested: `{ balance }` = sum
  of amounts.
- `src/lib/market.js` — `buyToken()` gains a `commission` parameter, passed
  straight through into the insert.

## UI / Flow Changes

- `App.jsx`: `balance`/`transactions` stop being `useState` + localStorage.
  New `rawWalletTx` state, fetched in the same mount `Promise.all(...)` as
  everything else. `balance` becomes derived:
  `aggregateWallet(rawWalletTx).balance`.
- `handleDeposit`/`handleWithdraw` become async (`depositFunds`/
  `withdrawFunds`), then update `rawWalletTx`.
- `handleBuyToken` simplifies — it already inserts into `token_purchases`;
  now also sends `commission`, and no longer manually touches balance at
  all (the trigger handles both sides). It re-fetches `rawWalletTx`
  afterward — the same fix pattern applied to Phase 2's tokenize-vote flow
  — so the buyer sees their own debit reflected immediately, without a page
  reload.
- `DashboardSidebar`'s transaction list stops receiving a pre-built `desc`
  string — it reconstructs "Bought X × SYM" / "Commission from 'Title'"
  client-side by looking up each row's `purchase_id` against the
  already-loaded purchases/tokens/posts data.

## Rollout

- SQL migration `supabase/migrations/0003_wallet.sql`: the
  `wallet_transactions` table + RLS + policies, `ALTER TABLE
  token_purchases ADD COLUMN commission ...` (+ its check constraint), and
  the trigger — run manually in the Supabase SQL editor, same process as
  Phases 1–2.
- Existing localStorage wallet data (`vdx_balance`, `vdx_transactions`) is
  **not** migrated — it was always fake and per-browser, never meant to
  represent anything durable. Clean cutover, same posture as Phase 2's
  token data.

## Testing

- Unit tests (Vitest) for `aggregateWallet` (balance summing across
  positive/negative amounts, empty-transactions edge case).
- Manual QA: deposit/withdraw persist and are visible across devices/logins
  (not localStorage-only); a real purchase correctly debits the buyer and
  credits the author, verified via direct query. Because wallet data is
  private now (unlike Phase 2's public tables), verification requires
  signing in as each side rather than an anonymous public read.

## Explicitly deferred (not this phase)

- Real payment processor, real payouts to authors, KYC/tax reporting
  (Phase 4 — Real Payments, not yet scoped).
- Overdraft prevention on withdrawals (accepted trust boundary above).
- Category proposals (still later, unchanged).
