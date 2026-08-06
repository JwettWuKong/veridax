# VERIDAX Backend Foundation — Design Spec

**Date:** 2026-08-06
**Status:** Approved, ready for implementation planning
**Phase:** 1 of 4 (Foundation)

## Background

An audit of `src/App.jsx` (the entire app is currently one 3,691-line client-only
React component) found that **every piece of state — accounts, posts, votes,
wallet balance, portfolio — lives only in that one browser's `localStorage`**
(`vdx_posts`, `vdx_accounts`, `vdx_votes`, `vdx_balance`, etc.). There is no
backend of any kind.

Consequences found during the audit:

- Two users on two different devices cannot see each other's posts, votes, or
  tokens — the "network of experts validating discoveries together" pitch is
  currently a single-player experience per browser.
- The "● LIVE — N works published" status bar reflects only the current
  browser's local data.
- Claims like "permanent," "immutable," "recorded across 19,203 nodes
  worldwide," and "cannot be edited, deleted, or suppressed by anyone" are
  false — clearing site data or switching browsers erases everything.
- Several buttons are fully cosmetic and change no state anywhere: Substack
  import (`SubModal`), Propose Category (`ProposeCategoryModal`), and
  Proof-of-Humanity verification (a 2.4s fake timer in `JoinModal`).
- Passwords are stored and compared in plaintext in the local `accounts`
  array.
- "Deposit" instantly credits fake balance with no real payment processor
  involved (the separate PayPal donation button is real and out of scope
  here).
- Publish/Tokenize confirmations show fabricated details: random fake tx
  hashes, invented node counts, invented block numbers.

## Roadmap (for context — only Phase 1 is designed/scoped here)

1. **Foundation** *(this spec)* — real backend, real auth, shared posts/validation.
2. **Tokenization & Market** — bonding-curve tokens, buy flow, portfolio, backed by real shared data.
3. **Wallet** — deposits/withdrawals/transaction history, decide on real payment processing.
4. **Category proposals** — real community voting to add new categories.

Each phase gets its own spec → plan → implementation cycle. This document
covers **Phase 1 only**.

## Phase 1 Scope

**In scope:**
- Real accounts via Supabase Auth (email + password, email verification required)
- Real, shared posts (publish → visible to every user, everywhere, immediately)
- Real, shared validation (upvote/dispute per cluster → real trust score, real
  diversity index, real tokenization-gate progress, computed from actual
  cross-user data)
- Truthful confirmation copy (no fake tx hashes / node counts / block numbers)
- Substack import button removed from the nav (was fully non-functional; real
  import is future scope, not yet assigned to a phase)

**Explicitly out of scope for Phase 1** (deferred to later phases or left
as-is): tokenization/bonding-curve market, portfolio, wallet
(deposit/withdraw/transactions), category proposals, real Proof-of-Humanity
verification (World ID / Gitcoin Passport).

## Architecture

**Approach: Supabase, direct client + Row Level Security.** The React app
talks straight to Supabase via `supabase-js` — no custom API server in this
phase. Security is enforced at the database layer via RLS policies and
constraints rather than server-side application code.

Considered and rejected for Phase 1:
- *Firebase/Firestore* — the data here (per-cluster vote tallies, commission
  tables, bonding-curve supply) is inherently relational; Postgres fits
  better than a document store.
- *Custom Node + Postgres service* — full control, but means writing and
  hosting everything Supabase already provides (auth, password hashing,
  session/refresh tokens, RLS) for free.
- *Supabase + a thin API layer* (Vercel serverless functions in front of it)
  — more control for custom server-side validation, but Phase 1's rules
  (one vote per user per post, insert-only-as-yourself, no edits/deletes) are
  fully expressible as RLS policies and DB constraints. An API layer can be
  added in a later phase if/when logic emerges that RLS can't express (e.g.
  real-money wallet rules in Phase 3).

**Frontend structure:** pull Supabase calls out of the single `App.jsx` file
into a small `src/lib/` data layer:
- `src/lib/supabaseClient.js` — client init from env vars
- `src/lib/auth.js` — signUp / signIn / signOut / session helpers
- `src/lib/posts.js` — fetch/insert posts
- `src/lib/votes.js` — fetch/insert votes, aggregate counts per cluster

`App.jsx` calls into this layer instead of `LS.get/set`. UI components and
existing pure functions (`calcTrustScore`, `shannonDiversity`, `checkGates`,
`bondingPrice`, etc.) are unchanged — they just receive real aggregated data
instead of local state.

## Data Model

Three tables in Postgres (via Supabase), plus Supabase's built-in
`auth.users`.

### `profiles`
One row per user, linked 1:1 to `auth.users`.

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `references auth.users(id)` |
| `username` | `text unique` | |
| `field` | `text` | |
| `cluster` | `text` | one of the 8 `CLUSTERS` ids |
| `credentials` | `jsonb` | array of `{type, value}`, unchanged shape from today |
| `joined_at` | `timestamptz` | `default now()` |

Created automatically by a Postgres trigger (`handle_new_user`) on
`auth.users` insert, reading username/cluster/field/credentials out of the
signup call's `user_metadata`. No separate "create profile" round-trip is
needed from the client.

### `posts`

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `author_id` | `uuid` | `references profiles(id)` |
| `cat` | `text` | category name, matches existing `CATS` |
| `title` | `text` | |
| `body` | `text` | full content (today only a 200-char summary is persisted — Phase 1 stores the full body too, for future detail views) |
| `summary` | `text` | derived/stored at publish time, unchanged from today's truncation logic |
| `evidence_links` | `jsonb` | array of `{type, url}`, unchanged shape |
| `flagship` | `boolean` | true only for Project Save Humanity |
| `created_at` | `timestamptz` | `default now()` |

### `votes`
Replaces the local `postVotes` / `postDisputes` / `userVotes` objects with a
single real table.

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `post_id` | `uuid` | `references posts(id)` |
| `user_id` | `uuid` | `references profiles(id)` |
| `cluster` | `text` | the voter's cluster, denormalized at vote time (matches current model) |
| `type` | `text` | `check (type in ('up','dispute'))` |
| `created_at` | `timestamptz` | `default now()` |

**Unique constraint on `(post_id, user_id)`** — one vote per person per post
is a real database guarantee, not just a client-side check someone could
bypass by editing localStorage.

### Row Level Security

- `profiles`, `posts`, `votes`: `select` allowed for everyone (including
  logged-out visitors, so Discover/browsing works without an account).
- `posts`: `insert` allowed only where `author_id = auth.uid()`.
- `votes`: `insert` allowed only where `user_id = auth.uid()`; blocked a
  second time by the unique constraint above.
- **No `update` or `delete` policy exists on `posts` or `votes` at all** —
  "permanent, cannot be edited or deleted" stops being marketing copy and
  becomes a real, enforced guarantee.
- This only holds if Row Level Security is explicitly turned on for all
  three tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Without that,
  Postgres/Supabase's default grants let the `anon`/`authenticated` roles
  read and write freely regardless of which policies exist. The migration
  script must enable RLS on `profiles`, `posts`, and `votes` before any
  policy is meaningful.

Trust score, Shannon diversity, and gate-progress math are **unchanged** —
same pure functions (`calcTrustScore`, `shannonDiversity`, `checkGates`),
just fed real aggregated vote rows fetched from Supabase instead of local
state.

## Auth & UX Flow Changes

- **JoinModal step 1 (account)**: calls real `supabase.auth.signUp()`
  instead of only collecting local state. After submitting, the user sees a
  "check your email to verify" notice before the flow continues.
- **JoinModal steps for cluster/field/credentials**: same UI as today; values
  are passed as `user_metadata` at signup and land in `profiles` via the
  trigger.
- **Proof-of-Humanity step**: relabeled honestly. Removes the fake
  "Verifying… Generating zero-knowledge proof" ceremony and the false
  "✓ recorded on-chain" claim. Replaced with a plain **"Identity verification
  — coming soon"** notice the user can skip. The `verified` checkmark badge
  is removed platform-wide until real World ID/Gitcoin integration ships in
  a future phase.
- **LoginModal**: real `supabase.auth.signInWithPassword()`; real Supabase
  error messages surfaced (wrong password / unconfirmed email / no account
  found).
- **Session handling**: delegated entirely to `supabase-js` (its own secure
  token storage + refresh). The manual `vdx_session` localStorage code is
  removed.
- **Publish flow**: real `insert` into `posts`. The confirmation screen shows
  the real post id, real timestamp, and real author instead of a fabricated
  tx hash, node count, and block number.
- **Validate/Dispute**: real `insert` into `votes`; a second attempt is
  rejected by the database constraint, not just a client-side guard.
- **Substack import**: button removed from the nav (was fully non-functional).
- **Error/loading states**: every flow above can now genuinely fail (network
  error, Supabase outage, RLS rejection, duplicate vote, unconfirmed email).
  Each gets a visible error message and disables its submit button while the
  request is in flight — today's fake `setTimeout` flows never had failure
  states to handle.
- **Stale local data cleanup**: on first load post-migration, the app stops
  reading the old `vdx_*` localStorage keys; a one-time cleanup clears them
  so nobody's left staring at orphaned fake local data.

## Rollout

- A free Supabase project must be created (dashboard signup — outside what
  this implementation can automate) and its project URL + anon key supplied.
- A single SQL migration script (tables, constraints, RLS policies, the
  `handle_new_user` trigger) will be written for the Supabase SQL editor.
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` get added to `.env` locally
  and to the Vercel project's environment variables for production.
- No existing real user data needs migrating — the live site currently has
  no real users, so Phase 1 launches against a clean/empty database.

## Testing

- Unit tests (Vitest) for the pure scoring functions — `calcTrustScore`,
  `shannonDiversity`, `checkGates` — currently untested.
- Manual QA checklist as the actual proof-of-done for this phase: sign up in
  two different browsers/incognito windows and confirm each one sees the
  other's published posts and votes.

## Explicitly deferred (not this phase)

- Real Proof-of-Humanity (World ID / Gitcoin Passport) integration
- Real Substack import (RSS/URL fetch)
- Tokenization, bonding-curve market, portfolio (Phase 2)
- Wallet: deposits, withdrawals, transaction history, real payment
  processing decision (Phase 3)
- Category proposals (Phase 4)
- Plaintext-password issue — resolved as a side effect of moving auth to
  Supabase (it hashes passwords itself); no separate fix needed.
