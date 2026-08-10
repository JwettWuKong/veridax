# VERIDAX Tokenization & Market Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fully-fake tokenization vote and the local-only knowledge-token market with a real, shared system: a genuine second voting system for tokenization (server-side auto-creation on threshold-crossing) and real, shared token purchases/portfolio.

**Architecture:** Continues Phase 1's pattern exactly — React app talks directly to Supabase via `supabase-js`, RLS enforces access, aggregates are always derived client-side from immutable rows fetched from `src/lib/`.

**Tech Stack:** React 19, Vite, Supabase (Postgres + RLS + a `security definer` trigger), Vitest.

**Spec:** `docs/superpowers/specs/2026-08-10-tokenization-market-design.md`

---

### Task 1: Update scoring.js to drop the citations gate

**Files:**
- Modify: `src/lib/scoring.js`
- Modify: `src/lib/scoring.test.js`

- [ ] **Step 1: Update the failing tests first**

Modify `src/lib/scoring.test.js` — find:
```js
describe("TOKEN_GATES", () => {
  it("exposes the expected threshold values", () => {
    expect(TOKEN_GATES).toEqual({
      upvotes: 10000,
      citations: 200,
      validations: 2500,
      diversity: 0.72,
      trustScore: 0.88,
    });
  });
});
```
Replace with:
```js
describe("TOKEN_GATES", () => {
  it("exposes the expected threshold values", () => {
    expect(TOKEN_GATES).toEqual({
      upvotes: 10000,
      validations: 2500,
      diversity: 0.72,
      trustScore: 0.88,
    });
  });
});
```

Find:
```js
describe("checkGates", () => {
  it("reports allMet: false when no gates are satisfied", () => {
    const result = checkGates({ up: 0, cite: 0 }, {}, {});
    expect(result.allMet).toBe(false);
    expect(result.metCount).toBe(0);
  });

  it("reports allMet: true when every gate threshold is reached", () => {
    const post = { up: 20000, cite: 300 };
    const passingVotes = { scientific:400, civil:400, independent:400, tech:400, grassroots:400, academic:400, journalism:400, legal:400 };
    const result = checkGates(post, passingVotes, {});
    expect(result.allMet).toBe(true);
    expect(result.metCount).toBe(5);
  });

  it("reports a partial pass when only some gate thresholds are reached, with correctly shaped items", () => {
    const post = { up: 20000, cite: 300 };
    const votes = { scientific: 100 };
    const result = checkGates(post, votes, {});

    expect(result.metCount).toBe(2);
    expect(result.allMet).toBe(false);

    const byKey = Object.fromEntries(result.items.map(i => [i.key, i]));
    expect(Object.keys(byKey).sort()).toEqual(
      ["citations", "diversity", "trustScore", "upvotes", "validations"].sort()
    );

    expect(byKey.upvotes).toMatchObject({ label: "UPVOTES", val: 20000, req: 10000 });
    expect(byKey.citations).toMatchObject({ label: "PEER CITATIONS", val: 300, req: 200 });
    expect(byKey.validations).toMatchObject({ label: "CROSS-CLUSTER VALIDATIONS", val: 100, req: 2500 });
    expect(byKey.diversity).toMatchObject({ label: "DIVERSITY INDEX", val: 0, req: 0.72 });
    expect(byKey.trustScore).toMatchObject({ label: "TRUST SCORE", val: 0.65, req: 0.88 });

    expect(byKey.upvotes.fmt(byKey.upvotes.val)).toBe("20.0K");
    expect(byKey.citations.fmt(byKey.citations.val)).toBe("300");
    expect(byKey.validations.fmt(byKey.validations.val)).toBe("100");
    expect(byKey.diversity.fmt(byKey.diversity.val)).toBe("0.0%");
    expect(byKey.trustScore.fmt(byKey.trustScore.val)).toBe("65.0%");
  });
});
```
Replace with:
```js
describe("checkGates", () => {
  it("reports allMet: false when no gates are satisfied", () => {
    const result = checkGates({ up: 0 }, {}, {});
    expect(result.allMet).toBe(false);
    expect(result.metCount).toBe(0);
  });

  it("reports allMet: true when every gate threshold is reached", () => {
    const post = { up: 20000 };
    const passingVotes = { scientific:400, civil:400, independent:400, tech:400, grassroots:400, academic:400, journalism:400, legal:400 };
    const result = checkGates(post, passingVotes, {});
    expect(result.allMet).toBe(true);
    expect(result.metCount).toBe(4);
  });

  it("reports a partial pass when only some gate thresholds are reached, with correctly shaped items", () => {
    const post = { up: 20000 };
    const votes = { scientific: 100 };
    const result = checkGates(post, votes, {});

    expect(result.metCount).toBe(1);
    expect(result.allMet).toBe(false);

    const byKey = Object.fromEntries(result.items.map(i => [i.key, i]));
    expect(Object.keys(byKey).sort()).toEqual(
      ["diversity", "trustScore", "upvotes", "validations"].sort()
    );

    expect(byKey.upvotes).toMatchObject({ label: "UPVOTES", val: 20000, req: 10000 });
    expect(byKey.validations).toMatchObject({ label: "CROSS-CLUSTER VALIDATIONS", val: 100, req: 2500 });
    expect(byKey.diversity).toMatchObject({ label: "DIVERSITY INDEX", val: 0, req: 0.72 });
    expect(byKey.trustScore).toMatchObject({ label: "TRUST SCORE", val: 0.65, req: 0.88 });

    expect(byKey.upvotes.fmt(byKey.upvotes.val)).toBe("20.0K");
    expect(byKey.validations.fmt(byKey.validations.val)).toBe("100");
    expect(byKey.diversity.fmt(byKey.diversity.val)).toBe("0.0%");
    expect(byKey.trustScore.fmt(byKey.trustScore.val)).toBe("65.0%");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `checkGates`/`TOKEN_GATES` still return the old 5-gate shape.

- [ ] **Step 3: Update `src/lib/scoring.js`**

Find:
```js
export const TOKEN_GATES = { upvotes:10000, citations:200, validations:2500, diversity:0.72, trustScore:0.88 };

export function checkGates(post, votes, disputes) {
  const trust      = calcTrustScore(votes, disputes);
  const diversity  = shannonDiversity(votes);
  const validCount = Object.values(votes).reduce((s, v) => s + v, 0);
  const items = [
    { key:"upvotes",     label:"UPVOTES",                    val:post.up,    req:TOKEN_GATES.upvotes,     fmt:v => nf(v) },
    { key:"citations",   label:"PEER CITATIONS",             val:post.cite,  req:TOKEN_GATES.citations,   fmt:v => v.toLocaleString() },
    { key:"validations", label:"CROSS-CLUSTER VALIDATIONS",  val:validCount, req:TOKEN_GATES.validations, fmt:v => nf(v) },
    { key:"diversity",   label:"DIVERSITY INDEX",            val:diversity,  req:TOKEN_GATES.diversity,   fmt:v => `${(v*100).toFixed(1)}%` },
    { key:"trustScore",  label:"TRUST SCORE",                val:trust,      req:TOKEN_GATES.trustScore,  fmt:v => `${(v*100).toFixed(1)}%` },
  ];
  const metCount = items.filter(g => g.val >= g.req).length;
  return { items, metCount, allMet: metCount === 5 };
}
```
Replace with:
```js
export const TOKEN_GATES = { upvotes:10000, validations:2500, diversity:0.72, trustScore:0.88 };

export function checkGates(post, votes, disputes) {
  const trust      = calcTrustScore(votes, disputes);
  const diversity  = shannonDiversity(votes);
  const validCount = Object.values(votes).reduce((s, v) => s + v, 0);
  const items = [
    { key:"upvotes",     label:"UPVOTES",                    val:post.up,    req:TOKEN_GATES.upvotes,     fmt:v => nf(v) },
    { key:"validations", label:"CROSS-CLUSTER VALIDATIONS",  val:validCount, req:TOKEN_GATES.validations, fmt:v => nf(v) },
    { key:"diversity",   label:"DIVERSITY INDEX",            val:diversity,  req:TOKEN_GATES.diversity,   fmt:v => `${(v*100).toFixed(1)}%` },
    { key:"trustScore",  label:"TRUST SCORE",                val:trust,      req:TOKEN_GATES.trustScore,  fmt:v => `${(v*100).toFixed(1)}%` },
  ];
  const metCount = items.filter(g => g.val >= g.req).length;
  return { items, metCount, allMet: metCount === 4 };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `scoring.test.js` tests green (citations references gone).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.js src/lib/scoring.test.js
git commit -m "Drop unreachable citations gate from tokenization eligibility"
```

**Context:** `post.cite` is hardcoded to `0` for every real post (no citation mechanism exists anywhere in the app) — the citations gate could never be satisfied, meaning no post could ever become eligible for tokenization. Per the approved spec, eligibility becomes the 4 remaining real gates. `post.up`/cross-cluster validations/diversity/trust score are unaffected — this task only removes the one unreachable gate.

---

### Task 2: Update "five gates" copy sitewide to "four gates"

**Files:**
- Modify: `src/App.jsx` (8 locations, static text/denominators only — no logic changes)

`checkGates` now returns 4 items instead of 5, so anywhere that renders `gateInfo.items.map(...)` already adjusts automatically. This task only fixes the *hardcoded* "5"/"five" text that doesn't auto-update.

- [ ] **Step 1: Fix the 3 gate-count denominators**

Locate each by searching for the exact string `{gateInfo.metCount}/5` (2 occurrences) and `{gates.metCount}/5` (1 occurrence) in `src/App.jsx`. Change each `/5` to `/4`. Do not change anything else on these lines — they're otherwise unrelated style/JSX.

- [ ] **Step 2: Fix the Market page empty-state copy**

Find (search for `"clears all five trust gates"`):
```
Tokens are created when a published work clears all five trust gates simultaneously and the community votes YES. The first tokenized discovery will appear here.
```
Replace `all five trust gates` with `all four trust gates`. Leave the rest of the sentence unchanged.

- [ ] **Step 3: Fix the Consensus page's gate section (4 spots in the same area)**

Search for `THE FIVE TOKENIZATION GATES` and change to `THE FOUR TOKENIZATION GATES`.

Search for `all five of these gates at the same time` and change to `all four of these gates at the same time`.

Search for `Meeting four out of five gates does nothing.` and the surrounding sentence — find the full text:
```
Meeting four out of five gates does nothing. All five must be met simultaneously. This AND-gate design means you cannot game any single metric in isolation. Once a post crosses all five thresholds simultaneously, the community votes on whether to launch a knowledge token for it.
```
Replace with:
```
Meeting three out of four gates does nothing. All four must be met simultaneously. This AND-gate design means you cannot game any single metric in isolation. Once a post crosses all four thresholds simultaneously, the community votes on whether to launch a knowledge token for it.
```
(Preserve whatever JSX/`<span>` tags wrap parts of this sentence in the actual file — only change the words, not the markup structure.)

Search for `"All Five Gates Clear"` (a step title in an array) and its paired description `"The post has simultaneously cleared all five thresholds. No shortcuts, no workarounds. The AND-gate design makes gaming any single metric futile."` — change to `"All Four Gates Clear"` and `"The post has simultaneously cleared all four thresholds. No shortcuts, no workarounds. The AND-gate design makes gaming any single metric futile."`.

- [ ] **Step 4: Sweep for anything missed**

Run: `grep -ni "five gate\|/5\b.*gate\|gate.*\bfive\b" src/App.jsx` (or search your editor for "five" case-insensitively within gate-related text) and confirm nothing else references the old 5-gate count. Note: `TokenizeModal`'s own internal "five gates" copy is intentionally NOT touched by this task — Task 7 replaces that whole component.

- [ ] **Step 5: Verify and commit**

Run: `npm run build` — must succeed.

```bash
git add src/App.jsx
git commit -m "Update gate-count copy from five to four sitewide"
```

---

### Task 3: Write the tokenization database migration

**Files:**
- Create: `supabase/migrations/0002_tokenization.sql`

- [ ] **Step 1: Write the migration script**

```sql
-- VERIDAX Phase 2 (Tokenization & Market): tokenize_votes, tokens, token_purchases.

-- tokenize_votes -------------------------------------------------------------
create table public.tokenize_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id),
  user_id uuid not null references public.profiles(id),
  vote text not null check (vote in ('yes', 'no')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.tokenize_votes enable row level security;

create index tokenize_votes_post_id_idx on public.tokenize_votes(post_id);

create policy "tokenize votes are publicly readable"
  on public.tokenize_votes for select
  using (true);

create policy "users can cast their own tokenize vote"
  on public.tokenize_votes for insert
  with check (auth.uid() = user_id);

-- tokens -----------------------------------------------------------------------
create table public.tokens (
  post_id uuid primary key references public.posts(id),
  created_at timestamptz not null default now()
);

alter table public.tokens enable row level security;

create policy "tokens are publicly readable"
  on public.tokens for select
  using (true);

-- Deliberately no insert policy for ordinary users — only the
-- handle_tokenize_vote trigger below (security definer) may create a
-- token row. No update/delete policy on this table at all.

-- token_purchases ----------------------------------------------------------------
create table public.token_purchases (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.tokens(post_id),
  user_id uuid not null references public.profiles(id),
  qty integer not null check (qty > 0),
  cost numeric not null check (cost >= 0),
  created_at timestamptz not null default now()
);

alter table public.token_purchases enable row level security;

create index token_purchases_post_id_idx on public.token_purchases(post_id);
create index token_purchases_user_id_idx on public.token_purchases(user_id);

create policy "token purchases are publicly readable"
  on public.token_purchases for select
  using (true);

create policy "users can record their own purchase"
  on public.token_purchases for insert
  with check (auth.uid() = user_id);

-- auto-tokenize trigger ----------------------------------------------------------
-- Fires after every tokenize vote. Recomputes the real yes/no tally for
-- that post; if it has reached the 100-vote quorum AND at least 66% YES,
-- and the post isn't already tokenized, creates the tokens row atomically,
-- entirely server-side. No client ever creates a token directly.
--
-- `on conflict (post_id) do nothing` is required, not decorative: without
-- it, every vote cast on a post AFTER it has already crossed threshold
-- would hit the tokens.post_id primary key and raise a unique-violation
-- error, aborting that voter's insert transaction entirely — i.e. voting
-- would break for everyone the moment a post tokenizes.
create or replace function public.handle_tokenize_vote()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  total_votes integer;
  yes_votes integer;
begin
  select count(*), count(*) filter (where vote = 'yes')
    into total_votes, yes_votes
    from public.tokenize_votes
    where post_id = new.post_id;

  if total_votes >= 100 and yes_votes::numeric / total_votes >= 0.66 then
    insert into public.tokens (post_id)
    values (new.post_id)
    on conflict (post_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger on_tokenize_vote_cast
  after insert on public.tokenize_votes
  for each row execute function public.handle_tokenize_vote();
```

- [ ] **Step 2: Run it against the Supabase project**

This step requires the human's Supabase dashboard access, which you do not have. Do not attempt to run this yourself. Just write the file and commit it.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0002_tokenization.sql
git commit -m "Add Phase 2 database migration: tokenize_votes, tokens, token_purchases"
```

## Before Reporting Back: Self-Review (do this carefully — nobody will run this SQL before your review completes)

- Is RLS explicitly enabled (`enable row level security`) on all three tables? Without it, the policies are decorative.
- Is there genuinely NO insert policy on `tokens` for ordinary users? (Search the file for `tokens` insert policies — there should be none.)
- Does the trigger's `on conflict (post_id) do nothing` actually prevent a unique-violation error on votes cast after tokenization? Trace through what happens on vote #101 after a post already tokenized at vote #100.
- Is the quorum/threshold math correct: `total_votes >= 100` AND `yes_votes::numeric / total_votes >= 0.66`? Check the `::numeric` cast is present so this isn't accidentally integer division (which would truncate to 0 or 1 for most ratios).
- Do foreign keys point at the right columns (`tokenize_votes.post_id → posts.id`, `token_purchases.post_id → tokens.post_id` — not `posts.id`, since a purchase should only be possible for an already-tokenized post)?
- Are the two FK indexes on `token_purchases` and the one on `tokenize_votes` present?

---

### Task 4: Build the tokenize-votes data-access layer

**Files:**
- Create: `src/lib/tokenizeVotes.js`
- Create: `src/lib/tokenizeVotes.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/tokenizeVotes.test.js`:
```js
import { describe, it, expect } from "vitest";
import { aggregateTokenizeVotes } from "./tokenizeVotes";

describe("aggregateTokenizeVotes", () => {
  const rows = [
    { post_id: "p1", user_id: "u1", vote: "yes" },
    { post_id: "p1", user_id: "u2", vote: "yes" },
    { post_id: "p1", user_id: "u3", vote: "no" },
    { post_id: "p2", user_id: "u1", vote: "no" },
  ];

  it("counts yes votes per post", () => {
    const { yesCounts } = aggregateTokenizeVotes(rows, null);
    expect(yesCounts.p1).toBe(2);
    expect(yesCounts.p2).toBeUndefined();
  });

  it("counts no votes per post", () => {
    const { noCounts } = aggregateTokenizeVotes(rows, null);
    expect(noCounts.p1).toBe(1);
    expect(noCounts.p2).toBe(1);
  });

  it("reports the given user's own vote per post", () => {
    const { userVotes } = aggregateTokenizeVotes(rows, "u1");
    expect(userVotes.p1).toBe("yes");
    expect(userVotes.p2).toBe("no");
  });

  it("omits posts the given user hasn't voted on", () => {
    const { userVotes } = aggregateTokenizeVotes(rows, "u2");
    expect(userVotes.p2).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/tokenizeVotes.js` does not exist yet.

- [ ] **Step 3: Write `src/lib/tokenizeVotes.js`**

```js
import { supabase } from "./supabaseClient";

export async function fetchTokenizeVotes() {
  const { data, error } = await supabase
    .from("tokenize_votes")
    .select("id, post_id, user_id, vote, created_at");
  if (error) throw error;
  return data;
}

export async function castTokenizeVote({ postId, userId, vote }) {
  const { data, error } = await supabase
    .from("tokenize_votes")
    .insert({ post_id: postId, user_id: userId, vote })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat tokenize_votes array (as returned by
// fetchTokenizeVotes) into:
//   yesCounts: { [postId]: number }
//   noCounts:  { [postId]: number }
//   userVotes: { [postId]: 'yes' | 'no' }  (for the given userId)
export function aggregateTokenizeVotes(votes, userId) {
  const yesCounts = {};
  const noCounts = {};
  const userVotes = {};
  for (const v of votes) {
    const bucket = v.vote === "yes" ? yesCounts : noCounts;
    bucket[v.post_id] = (bucket[v.post_id] || 0) + 1;
    if (userId && v.user_id === userId) {
      userVotes[v.post_id] = v.vote;
    }
  }
  return { yesCounts, noCounts, userVotes };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `tokenizeVotes.test.js` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/tokenizeVotes.js src/lib/tokenizeVotes.test.js
git commit -m "Add tokenize-votes data-access layer with tested aggregation"
```

**Context:** This is the sixth `src/lib/` module, mirroring `votes.js`'s exact shape and conventions. `fetchTokenizeVotes`/`castTokenizeVote` are thin network wrappers (no automated tests, per the established convention — network-dependent). `aggregateTokenizeVotes` is pure and fully tested. The migration in Task 3 must already be applied to the live project for `castTokenizeVote` to work live later, but this task itself needs no live database access — it's pure code + unit tests.

---

### Task 5: Build the market data-access layer

**Files:**
- Create: `src/lib/market.js`
- Create: `src/lib/market.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/market.test.js`:
```js
import { describe, it, expect } from "vitest";
import { aggregateMarket } from "./market";

describe("aggregateMarket", () => {
  const tokens = [{ post_id: "p1", created_at: "2026-01-01T00:00:00Z" }];
  const purchases = [
    { post_id: "p1", user_id: "u1", qty: 10 },
    { post_id: "p1", user_id: "u2", qty: 5 },
  ];

  it("reports which posts are tokenized", () => {
    const { tokenizedPostIds } = aggregateMarket(tokens, purchases, null);
    expect(tokenizedPostIds.has("p1")).toBe(true);
    expect(tokenizedPostIds.has("p2")).toBe(false);
  });

  it("sums total quantity purchased per post across all users", () => {
    const { supplyAddByPost } = aggregateMarket(tokens, purchases, null);
    expect(supplyAddByPost.p1).toBe(15);
  });

  it("sums quantity purchased by a specific user per post", () => {
    const { myPurchasesByPost } = aggregateMarket(tokens, purchases, "u1");
    expect(myPurchasesByPost.p1).toBe(10);
  });

  it("omits posts the given user hasn't purchased", () => {
    const { myPurchasesByPost } = aggregateMarket(tokens, [], "u1");
    expect(myPurchasesByPost.p1).toBeUndefined();
  });

  it("returns an empty set when no posts are tokenized", () => {
    const { tokenizedPostIds } = aggregateMarket([], [], null);
    expect(tokenizedPostIds.size).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/market.js` does not exist yet.

- [ ] **Step 3: Write `src/lib/market.js`**

```js
import { supabase } from "./supabaseClient";

export async function fetchTokens() {
  const { data, error } = await supabase
    .from("tokens")
    .select("post_id, created_at");
  if (error) throw error;
  return data;
}

export async function fetchPurchases() {
  const { data, error } = await supabase
    .from("token_purchases")
    .select("id, post_id, user_id, qty, cost, created_at");
  if (error) throw error;
  return data;
}

export async function buyToken({ postId, userId, qty, cost }) {
  const { data, error } = await supabase
    .from("token_purchases")
    .insert({ post_id: postId, user_id: userId, qty, cost })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates raw tokens + token_purchases rows into:
//   tokenizedPostIds:  Set<postId>
//   supplyAddByPost:   { [postId]: number }  (total qty purchased across everyone)
//   myPurchasesByPost: { [postId]: number }  (total qty purchased by the given userId)
export function aggregateMarket(tokens, purchases, userId) {
  const tokenizedPostIds = new Set(tokens.map(t => t.post_id));
  const supplyAddByPost = {};
  const myPurchasesByPost = {};
  for (const p of purchases) {
    supplyAddByPost[p.post_id] = (supplyAddByPost[p.post_id] || 0) + p.qty;
    if (userId && p.user_id === userId) {
      myPurchasesByPost[p.post_id] = (myPurchasesByPost[p.post_id] || 0) + p.qty;
    }
  }
  return { tokenizedPostIds, supplyAddByPost, myPurchasesByPost };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `market.test.js` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/market.js src/lib/market.test.js
git commit -m "Add market data-access layer with tested aggregation"
```

**Context:** Seventh `src/lib/` module. Note `tokens`/`token_purchases` deliberately do NOT store a token symbol — the symbol is a pure function of the post's title, computed in `App.jsx` (which already has post titles loaded), not here. This module only knows post IDs, quantities, and costs — it has no concept of "symbol" at all, by design (see the spec's Data Model section for why).

---

### Task 6: Wire real tokenization & market data into App.jsx

**Files:**
- Modify: `src/App.jsx` (imports, state block, mount effect, handlers, bottom render block)

- [ ] **Step 1: Add imports**

Find the existing import block (should currently read, after Phase 1):
```js
import { fetchPosts, createPost } from "./lib/posts";
import { fetchVotes, castVote, aggregateVotes } from "./lib/votes";
```
Add two more lines after it:
```js
import { fetchTokenizeVotes, castTokenizeVote, aggregateTokenizeVotes } from "./lib/tokenizeVotes";
import { fetchTokens, fetchPurchases, buyToken as recordTokenPurchase, aggregateMarket } from "./lib/market";
```
(`buyToken` is aliased to `recordTokenPurchase` on import — the existing code already has a variable named `buyToken` representing "the token currently being purchased," computed later in this same file. Aliasing avoids a naming collision; do not rename the existing `buyToken` variable.)

- [ ] **Step 2: Replace the state block, `posts`/`tokens`/`buyToken` derivation, and remove `localTokenData`**

Find:
```js
  const [expertCount,   setExpertCount]  = useState(0);
  const [dataLoading,   setDataLoading]  = useState(true);
  const [dataError,     setDataError]    = useState("");
  // Tokenization is Phase 2 — until posts have a real tokenData column,
  // any tokenized/bought state stays local-only, same as before, keyed by
  // post id so it survives reloads within this browser.
  const [localTokenData, setLocalTokenData] = useState(() => LS.get('vdx_tokendata', {}));
  const [portfolio,    setPortfolio]    = useState(() => LS.get('vdx_portfolio', {}));
  const [validatingPost,  setValidatingPost]  = useState(null);
  const [tokenizePost,    setTokenizePost]    = useState(null);
  const [buyTokenSym,     setBuyTokenSym]     = useState(null);
  const [detailPost,      setDetailPost]      = useState(null);
  const [discoverFilter,  setDiscoverFilter]  = useState("all");
  const [discoverSearch,  setDiscoverSearch]  = useState("");
  const [discoverSort,    setDiscoverSort]    = useState("newest");
  const [showProposecat,  setShowProposecat]  = useState(false);

  const { postVotes, postDisputes, userVotes, upCounts } = aggregateVotes(rawVotes, user?.id);

  const posts = postRows.map(row => {
    const catInfo = CATS.find(c => c.name === row.cat);
    const base = {
      id: row.id,
      cat: row.cat,
      icon: catInfo?.icon || "📄",
      color: catInfo?.color || C.amber,
      title: row.title,
      body: row.body,
      summary: row.summary,
      author: row.profiles?.username || "unknown",
      field: row.profiles?.field || "",
      verified: false,
      substack: false,
      flagship: row.flagship,
      up: upCounts[row.id] || 0,
      cite: 0,
    };
    return localTokenData[row.id] ? { ...base, tokenData: localTokenData[row.id] } : base;
  });

  const tokens = posts
    .filter(p => p.tokenData)
    .map(p => ({ sym:p.tokenData.sym, name:p.title, price:bondingPrice(p.tokenData.supply), ch:p.tokenData.change, col:p.tokenData.col, supply:p.tokenData.supply, commission:p.tokenData.commission ?? commissionRate(p.cat) }));
  const buyToken = buyTokenSym ? tokens.find(t => t.sym === buyTokenSym) : null;
```
Replace with:
```js
  const [expertCount,   setExpertCount]  = useState(0);
  const [dataLoading,   setDataLoading]  = useState(true);
  const [dataError,     setDataError]    = useState("");
  const [tokenRows,        setTokenRows]        = useState([]);
  const [rawTokenizeVotes, setRawTokenizeVotes] = useState([]);
  const [rawPurchases,     setRawPurchases]     = useState([]);
  const [validatingPost,  setValidatingPost]  = useState(null);
  const [tokenizePost,    setTokenizePost]    = useState(null);
  const [buyTokenSym,     setBuyTokenSym]     = useState(null);
  const [detailPost,      setDetailPost]      = useState(null);
  const [discoverFilter,  setDiscoverFilter]  = useState("all");
  const [discoverSearch,  setDiscoverSearch]  = useState("");
  const [discoverSort,    setDiscoverSort]    = useState("newest");
  const [showProposecat,  setShowProposecat]  = useState(false);

  const { postVotes, postDisputes, userVotes, upCounts } = aggregateVotes(rawVotes, user?.id);
  const { yesCounts: tokenizeYes, noCounts: tokenizeNo, userVotes: tokenizeUserVotes } = aggregateTokenizeVotes(rawTokenizeVotes, user?.id);
  const { tokenizedPostIds, supplyAddByPost, myPurchasesByPost } = aggregateMarket(tokenRows, rawPurchases, user?.id);

  const tokenSymbolFor = title => title.split(" ").slice(0,2).map(w => w[0]).join("") + "X";

  const posts = postRows.map(row => {
    const catInfo = CATS.find(c => c.name === row.cat);
    const base = {
      id: row.id,
      cat: row.cat,
      icon: catInfo?.icon || "📄",
      color: catInfo?.color || C.amber,
      title: row.title,
      body: row.body,
      summary: row.summary,
      author: row.profiles?.username || "unknown",
      field: row.profiles?.field || "",
      verified: false,
      substack: false,
      flagship: row.flagship,
      up: upCounts[row.id] || 0,
      cite: 0,
    };
    if (!tokenizedPostIds.has(row.id)) return base;
    return {
      ...base,
      tokenData: {
        sym: tokenSymbolFor(row.title),
        supply: 1000 + (supplyAddByPost[row.id] || 0),
        col: base.color,
        change: 0,
        commission: commissionRate(row.cat),
      },
    };
  });

  const tokens = posts
    .filter(p => p.tokenData)
    .map(p => ({ postId:p.id, sym:p.tokenData.sym, name:p.title, price:bondingPrice(p.tokenData.supply), ch:p.tokenData.change, col:p.tokenData.col, supply:p.tokenData.supply, commission:p.tokenData.commission }));
  const buyToken = buyTokenSym ? tokens.find(t => t.sym === buyTokenSym) : null;

  const portfolio = {};
  posts.forEach(p => {
    if (p.tokenData && myPurchasesByPost[p.id]) portfolio[p.tokenData.sym] = myPurchasesByPost[p.id];
  });
```

(`portfolio` is now a plain derived object, not `useState` — it's recomputed every render from real purchase data, the same pattern already established for `posts`/`tokens`/`postVotes` in Phase 1. `DashboardSidebar` already consumes `portfolio` as a `{sym: qty}` object and `tokens` as an array with `sym`/`price`/`col` — both shapes are unchanged, so `DashboardSidebar` itself needs NO changes in this plan.)

- [ ] **Step 3: Remove the old localStorage persistence effects for tokenization/portfolio**

Find and DELETE these two lines (search for them individually — they may not be adjacent):
```js
  useEffect(() => LS.set('vdx_portfolio', portfolio), [portfolio]);
```
```js
  useEffect(() => LS.set('vdx_tokendata', localTokenData), [localTokenData]);
```
(`portfolio` is no longer `useState`, so persisting it no longer makes sense or compiles. There is no more `localTokenData` to persist — real data replaces both.)

- [ ] **Step 4: Extend the mount data-loading effect to also fetch tokenization/market data**

Find:
```js
  useEffect(() => {
    let active = true;
    (async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const [posts, votes, profileCount] = await Promise.all([fetchPosts(), fetchVotes(), fetchProfileCount()]);
        if (!active) return;
        setPostRows(posts);
        setRawVotes(votes);
        setExpertCount(profileCount);
      } catch {
        if (active) setDataError("Couldn't load VERIDAX data. Check your connection and refresh.");
      } finally {
        if (active) setDataLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);
```
Replace with:
```js
  useEffect(() => {
    let active = true;
    (async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const [posts, votes, profileCount, tokenizeVotes, tokenRows, purchases] = await Promise.all([
          fetchPosts(), fetchVotes(), fetchProfileCount(), fetchTokenizeVotes(), fetchTokens(), fetchPurchases(),
        ]);
        if (!active) return;
        setPostRows(posts);
        setRawVotes(votes);
        setExpertCount(profileCount);
        setRawTokenizeVotes(tokenizeVotes);
        setTokenRows(tokenRows);
        setRawPurchases(purchases);
      } catch {
        if (active) setDataError("Couldn't load VERIDAX data. Check your connection and refresh.");
      } finally {
        if (active) setDataLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);
```

- [ ] **Step 5: Replace `handleTokenized`/`handleBought` with real handlers**

Find:
```js
  const handleTokenized = (postId, sym) => {
    const post = posts.find(p => p.id === postId);
    setLocalTokenData(prev => ({
      ...prev,
      [postId]: { sym, supply: 1000, col: post?.color || C.amber, change: 0, commission: commissionRate(post?.cat) },
    }));
    setTokenizePost(null);
  };

  const handleBought = (sym, qty, cost) => {
    const postId = Object.keys(localTokenData).find(id => localTokenData[id].sym === sym);
    if (postId) {
      setLocalTokenData(prev => ({ ...prev, [postId]: { ...prev[postId], supply: prev[postId].supply + qty } }));
    }
    setPortfolio(prev => ({ ...prev, [sym]: (prev[sym] || 0) + qty }));
    if (cost > 0) {
      setBalance(prev => prev - cost);
      addTx("buy", -cost, `Bought ${qty.toLocaleString()} × ⬡ ${sym}`);
    }
  };
```
Replace with:
```js
  const handleTokenizeVote = async (postId, vote) => {
    if (!user || tokenizeUserVotes[postId]) return;
    const cast = await castTokenizeVote({ postId, userId: user.id, vote });
    setRawTokenizeVotes(prev => [...prev, cast]);
  };

  const handleBuyToken = async (postId, qty, cost) => {
    if (!user) return;
    const purchase = await recordTokenPurchase({ postId, userId: user.id, qty, cost });
    setRawPurchases(prev => [...prev, purchase]);
    if (cost > 0) {
      setBalance(prev => prev - cost);
      const sym = tokens.find(t => t.postId === postId)?.sym || "";
      addTx("buy", -cost, `Bought ${qty.toLocaleString()} × ⬡ ${sym}`);
    }
  };
```

(Wallet balance deduction stays exactly as before — local-only, unchanged, per the spec's explicit scope boundary. Only the token-ownership side of a purchase becomes real.)

- [ ] **Step 6: Update the bottom modal render block**

Find:
```jsx
      {tokenizePost && (
        <TokenizeModal
          post={tokenizePost}
          votes={postVotes[tokenizePost.id] || {}}
          disputes={postDisputes[tokenizePost.id] || {}}
          user={user}
          onClose={() => setTokenizePost(null)}
          onTokenized={handleTokenized}
        />
      )}
      {buyToken && <BuyModal token={buyToken} user={user} balance={balance} onClose={() => setBuyTokenSym(null)} onBought={handleBought} onNeedDeposit={() => setShowProfile(true)}/>}
```
Replace with:
```jsx
      {tokenizePost && (
        <TokenizeModal
          post={tokenizePost}
          votes={postVotes[tokenizePost.id] || {}}
          disputes={postDisputes[tokenizePost.id] || {}}
          yesVotes={tokenizeYes[tokenizePost.id] || 0}
          noVotes={tokenizeNo[tokenizePost.id] || 0}
          hasVoted={tokenizeUserVotes[tokenizePost.id] || null}
          isTokenized={!!tokens.find(t => t.postId === tokenizePost.id)}
          user={user}
          onClose={() => setTokenizePost(null)}
          onVote={vote => handleTokenizeVote(tokenizePost.id, vote)}
        />
      )}
      {buyToken && <BuyModal token={buyToken} user={user} balance={balance} onClose={() => setBuyTokenSym(null)} onBought={(qty, cost) => handleBuyToken(buyToken.postId, qty, cost)} onNeedDeposit={() => setShowProfile(true)}/>}
```

- [ ] **Step 7: Sanity check**

Run: `npm run build` — will NOT fully succeed yet, because `TokenizeModal` (still expecting its old `onTokenized` prop and internal fake state) and `BuyModal` (still calling `onBought(token.sym, qty, totalCost)` with the old 3-arg signature) haven't been rewritten yet — that's Tasks 7 and 8, immediately next. Confirm the errors you see are ONLY in `TokenizeModal`/`BuyModal` (e.g. `onTokenized is not defined`-style issues once those components are read in context) and not anywhere else — this task's own edits should otherwise be internally consistent.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "Wire real tokenization and market data into App.jsx"
```

**Context:** This task deliberately leaves `TokenizeModal` and `BuyModal` themselves untouched — they are rewritten in Tasks 7 and 8 immediately following. The app will be briefly inconsistent between this commit and the end of Task 8, the same pattern used throughout Phase 1 (e.g. Task 8 → Task 9 → Task 10 there).

---

### Task 7: Rewrite TokenizeModal for real voting

**Files:**
- Modify: `src/App.jsx` (the `TokenizeModal` component definition only)

- [ ] **Step 1: Replace the entire `TokenizeModal` component**

Find the full component (from `function TokenizeModal({ post, votes, disputes, user, onClose, onTokenized }) {` through its closing `}`) and replace the WHOLE thing with:

```jsx
function TokenizeModal({ post, votes, disputes, yesVotes, noVotes, hasVoted, isTokenized, user, onClose, onVote }) {
  const [voted, setVoted] = useState(hasVoted || null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { items: gateItems, allMet } = checkGates(post, votes, disputes);
  const total = yesVotes + noVotes;
  const yesPct = total === 0 ? 0 : yesVotes / total;
  const suggestedSymbol = post.title.split(" ").slice(0,2).map(w => w[0]).join("") + "X";

  const handleVote = async type => {
    if (voted || voting || !user) return;
    setVoting(true);
    setVoteError("");
    try {
      await onVote(type);
      setVoted(type);
    } catch (err) {
      setVoteError(err.message || "Could not record your vote. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000000d0",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e => e.stopPropagation()} style={{background:`linear-gradient(160deg,${C.earth},${C.bark})`,border:`1px solid ${C.amber}44`,borderRadius:20,padding:28,maxWidth:500,width:"100%",position:"relative",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{height:2,background:`linear-gradient(90deg,${C.amber},${C.copper})`,borderRadius:2,marginBottom:18}}/>
        <button onClick={onClose} style={{position:"absolute",top:15,right:15,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:7,padding:"4px 9px",cursor:"pointer",fontFamily:"monospace",fontSize:10}}>✕</button>

        {isTokenized ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:14,animation:"sway 2s ease-in-out infinite"}}>⬡</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.amber,letterSpacing:3,marginBottom:8}}>TOKEN CREATED</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.parch,marginBottom:12}}>⬡ {suggestedSymbol}</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:20}}>The community voted to tokenize this discovery. A bonding curve token exists. The author earns a commission on every purchase — automatically and forever.</p>
            <div style={{background:C.card,border:`1px solid ${C.amber}28`,borderRadius:10,padding:"12px 14px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left",marginBottom:20}}>
              <div>⬡ <span style={{color:C.tan}}>Symbol:</span> <span style={{color:C.amber}}>⬡ {suggestedSymbol}</span></div>
              <div>⬡ <span style={{color:C.tan}}>Author commission:</span> <span style={{color:C.sprout}}>{commissionRate(post.cat)}% per purchase · locked forever</span></div>
              <div>⬡ <span style={{color:C.tan}}>Pricing:</span> Bonding curve · rises with demand</div>
              <div>⬡ <span style={{color:C.tan}}>Community YES vote:</span> {yesVotes.toLocaleString()} ({total > 0 ? (yesPct*100).toFixed(0) : 0}%)</div>
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              VIEW IN MARKET →
            </button>
          </div>
        ) : (
          <>
            <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2,marginBottom:4}}>TOKENIZATION VOTE</div>
            <div style={{fontSize:13,fontFamily:"'Palatino Linotype',serif",color:C.parch,marginBottom:18,lineHeight:1.4,fontWeight:700,paddingRight:30}}>{post.title}</div>

            {/* Four gates */}
            <div style={{background:C.card,border:`1px solid ${C.amber}22`,borderRadius:12,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:7,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:10}}>ALL 4 GATES MUST BE MET SIMULTANEOUSLY</div>
              {gateItems.map(g => {
                const met = g.val >= g.req;
                const pct = Math.min((g.val / g.req) * 100, 100);
                return (
                  <div key={g.key} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <span style={{fontSize:9,color:met?C.sprout:C.dust,width:12}}>{met?"✓":"·"}</span>
                        <span style={{fontSize:7,fontFamily:"monospace",color:met?C.sprout:C.dust,letterSpacing:.5}}>{g.label}</span>
                      </div>
                      <div style={{fontSize:8,fontFamily:"monospace",color:met?C.sprout:C.dust}}>
                        {g.fmt(g.val)} <span style={{color:C.shadow}}>/ {g.fmt(g.req)}</span>
                      </div>
                    </div>
                    <div style={{height:4,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:met?C.sprout:C.amber,borderRadius:2,transition:"width .5s ease"}}/>
                    </div>
                  </div>
                );
              })}
              {allMet && (
                <div style={{marginTop:10,padding:"8px 10px",background:C.sproutD,border:`1px solid ${C.sprout}30`,borderRadius:7,fontSize:8,fontFamily:"monospace",color:C.sprout,letterSpacing:1}}>
                  ✓ ALL 4 GATES CLEARED — ELIGIBLE FOR TOKENIZATION
                </div>
              )}
            </div>

            {/* AND-gate warning */}
            <div style={{background:C.amberD,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"10px 13px",marginBottom:14,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Meeting three out of four gates does nothing. All four must be met <span style={{color:C.parch}}>simultaneously</span>. You cannot game any single metric in isolation.
            </div>

            {/* Community vote */}
            <div style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.dust,letterSpacing:2}}>COMMUNITY TOKENIZATION VOTE</span>
                <span style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>{total.toLocaleString()} votes cast · {Math.max(100 - total, 0).toLocaleString()} more needed for quorum</span>
              </div>
              <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}>
                <div style={{width:`${yesPct*100}%`,background:C.sprout,transition:"width .4s ease"}}/>
                <div style={{flex:1,background:C.bloom}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:8,fontFamily:"monospace",color:C.sprout}}>YES {(yesPct*100).toFixed(0)}% · {yesVotes.toLocaleString()}</span>
                <span style={{fontSize:7,fontFamily:"monospace",color:C.dust}}>Threshold: 66% YES · 100 vote quorum</span>
                <span style={{fontSize:8,fontFamily:"monospace",color:C.bloom}}>NO {total > 0 ? (100-yesPct*100).toFixed(0) : 0}% · {noVotes.toLocaleString()}</span>
              </div>
            </div>

            {voteError && (
              <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:10,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
                ✕ {voteError}
              </div>
            )}

            {voted ? (
              <div style={{textAlign:"center",padding:"11px",background:voted==="yes"?C.sproutD:`${C.bloom}0c`,border:`1px solid ${voted==="yes"?C.sprout+"33":C.bloom+"33"}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:voted==="yes"?C.sprout:C.bloom}}>
                {voted==="yes" ? "✓ Voted YES to tokenize" : "✗ Voted NO"}
              </div>
            ) : voting ? (
              <div style={{textAlign:"center",padding:"11px",fontSize:9,fontFamily:"monospace",color:C.amber,letterSpacing:2,animation:"pulse 1s infinite"}}>RECORDING…</div>
            ) : user ? (
              <div style={{display:"flex",gap:8}}>
                <button onClick={() => handleVote("yes")}
                  style={{flex:2,background:`${C.sprout}14`,border:`1px solid ${C.sprout}44`,color:C.sprout,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  ★ YES — TOKENIZE
                </button>
                <button onClick={() => handleVote("no")}
                  style={{flex:1,background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,color:C.bloom,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  NO
                </button>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"12px",border:`1px solid ${C.shadow}`,borderRadius:9,fontSize:9,fontFamily:"monospace",color:C.dust}}>
                Sign in to vote on tokenization.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Sanity check**

Run: `npm run build` — should now succeed (this was the source of the errors noted at the end of Task 6).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Rewrite TokenizeModal for real tokenization voting"
```

**Context:** The fake `yesVotes`/`noVotes` state (hardcoded 1,316/684 seed), the fake `handleVote` (which unilaterally tokenized on a single YES click), and the fake `creating`/`created` timeout states are gone entirely. Real vote tallies and the real "is this post already tokenized" fact now flow in as props from `App.jsx` (Task 6). Casting a vote just calls `onVote(type)` and waits — if that vote happens to be the one crossing the real 100-vote/66% threshold, the database trigger (Task 3) has already created the token by the time the insert call resolves; the next time `App.jsx`'s data refreshes, `isTokenized` becomes true and this modal reflects it. This mirrors `ValidationModal`'s exact async/error-handling pattern from Phase 1.

---

### Task 8: Rewrite BuyModal for real purchases

**Files:**
- Modify: `src/App.jsx` (the `BuyModal` component only — state declarations, `handleBuy`, the processing overlay copy, the success screen copy)

- [ ] **Step 1: Add error state and rewrite `handleBuy`**

Find:
```js
function BuyModal({ token, user, balance, onClose, onBought, onNeedDeposit }) {
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [record, setRecord] = useState(null);
```
Replace with:
```js
function BuyModal({ token, user, balance, onClose, onBought, onNeedDeposit }) {
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [bought, setBought] = useState(false);
  const [record, setRecord] = useState(null);
  const [buyError, setBuyError] = useState("");
```

Find:
```js
  const handleBuy = () => {
    if (!user || buying || bought || !sufficientBalance) return;
    const rec = { qty, cost: totalCost, newSupply: token.supply + qty, newPrice: bondingPrice(token.supply + qty) };
    setBuying(true);
    setTimeout(() => { setBuying(false); setBought(true); setRecord(rec); if (onBought) onBought(token.sym, qty, totalCost); }, 2000);
  };
```
Replace with:
```js
  const handleBuy = async () => {
    if (!user || buying || bought || !sufficientBalance) return;
    setBuying(true);
    setBuyError("");
    try {
      if (onBought) await onBought(qty, totalCost);
      setRecord({ qty, cost: totalCost, newSupply: token.supply + qty, newPrice: bondingPrice(token.supply + qty) });
      setBought(true);
    } catch (err) {
      setBuyError(err.message || "Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };
```

- [ ] **Step 2: Drop the fake "broadcasting to nodes" processing copy**

Find:
```jsx
        ) : buying ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite",color:token.col}}>⬡</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:token.col,letterSpacing:2,marginBottom:6}}>PROCESSING…</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>Updating bonding curve · Routing author commission · Broadcasting to nodes</div>
            <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden",maxWidth:280,margin:"0 auto"}}>
              <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${token.col},${C.copper})`,animation:"fadein 2s linear forwards"}}/>
            </div>
          </div>
        ) : (
```
Replace with:
```jsx
        ) : buying ? (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite",color:token.col}}>⬡</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:token.col,letterSpacing:2}}>PROCESSING…</div>
          </div>
        ) : (
```

- [ ] **Step 3: Drop the false "recorded on-chain" claim**

Find:
```jsx
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:16}}>Recorded on-chain. New token price: <span style={{color:token.col,fontFamily:"monospace",fontWeight:700}}>${record.newPrice.toFixed(2)}</span></p>
```
Replace with:
```jsx
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:16}}>New token price: <span style={{color:token.col,fontFamily:"monospace",fontWeight:700}}>${record.newPrice.toFixed(2)}</span></p>
```

- [ ] **Step 4: Add the error banner before the buy button**

Find:
```jsx
            {user ? (
              <button onClick={handleBuy} disabled={!sufficientBalance}
                style={{width:"100%",background:sufficientBalance?`linear-gradient(135deg,${token.col}22,${C.vine}12)`:`${C.shadow}`,border:`1px solid ${sufficientBalance?token.col+"55":C.shadow}`,color:sufficientBalance?token.col:C.dust,borderRadius:9,padding:"13px",fontFamily:"monospace",fontSize:10,cursor:sufficientBalance?"pointer":"not-allowed",letterSpacing:2,fontWeight:700}}>
                {sufficientBalance ? `BUY ${qty} ${token.sym} — $${totalCost.toFixed(2)} →` : `INSUFFICIENT BALANCE`}
              </button>
            ) : (
```
Replace with:
```jsx
            {buyError && (
              <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
                ✕ {buyError}
              </div>
            )}

            {user ? (
              <button onClick={handleBuy} disabled={!sufficientBalance}
                style={{width:"100%",background:sufficientBalance?`linear-gradient(135deg,${token.col}22,${C.vine}12)`:`${C.shadow}`,border:`1px solid ${sufficientBalance?token.col+"55":C.shadow}`,color:sufficientBalance?token.col:C.dust,borderRadius:9,padding:"13px",fontFamily:"monospace",fontSize:10,cursor:sufficientBalance?"pointer":"not-allowed",letterSpacing:2,fontWeight:700}}>
                {sufficientBalance ? `BUY ${qty} ${token.sym} — $${totalCost.toFixed(2)} →` : `INSUFFICIENT BALANCE`}
              </button>
            ) : (
```

- [ ] **Step 5: Sanity check and commit**

Run: `npm run build` — must succeed.
Run: `npm run test` — all tests (scoring, votes, tokenizeVotes, market) must still pass.

```bash
git add src/App.jsx
git commit -m "Rewrite BuyModal for real token purchases"
```

**Context:** The bonding-curve math (`bondingPrice`, `bondingCost`, the SVG curve rendering, the quantity picker) was already correct and needed no changes — only the fake `setTimeout` and the two false claims ("broadcasting to nodes," "recorded on-chain") are removed. `onBought`'s call signature changed from `(sym, qty, cost)` to `(qty, cost)` since the render call site in Task 6 already closes over `buyToken.postId` — this file's own internal call just needs updating to match, which Step 1 already does.

---

### Task 9: Deploy migration and run end-to-end QA

**Files:** none (configuration + manual/scripted verification)

- [ ] **Step 1: Human runs the migration**

Give the human the contents of `supabase/migrations/0002_tokenization.sql` to paste into their Supabase project's SQL Editor and run, the same way Phase 1's migration was applied. Confirm "Success. No rows returned," and that `tokenize_votes`, `tokens`, `token_purchases` appear in Table Editor.

- [ ] **Step 2: Deploy**

Once merged to `main` and pushed, trigger a fresh Vercel deploy (no new env vars needed this phase — same two Supabase variables from Phase 1 cover this too). Confirm the deployed bundle size looks consistent with a real build (same class of check used in Phase 1 — compare against the known-good bundle hash/size if in doubt).

- [ ] **Step 3: Verify the quorum/threshold trigger is correct**

Casting 100 real votes by hand isn't practical, and there's no service-role key available to script 100 synthetic confirmed users. Verify correctness through the combination that's actually achievable, and report exactly which of these you completed:

1. **Small-scale live proof of the mechanism itself** (not the exact threshold number): using whatever real confirmed test accounts already exist in the project (from Phase 1/Task 9's earlier live testing), cast 2-3 real votes on the same post via `castTokenizeVote`. Confirm each insert succeeds, a second vote attempt by the same user on the same post is rejected by the unique constraint, and `fetchTokenizeVotes` + `aggregateTokenizeVotes` correctly reflect the real tally. This proves the insert/RLS/aggregation path works end-to-end — it will not by itself cross 100 votes or create a token, and that's expected.
2. **Exact boundary-case arithmetic, computed and reported explicitly** (this is what actually proves the 100/0.66 logic is right, independent of how many accounts exist): with `total_votes = 100, yes_votes = 66` → `66/100 = 0.66 >= 0.66` → **true**, should tokenize. With `total_votes = 100, yes_votes = 65` → `65/100 = 0.65 >= 0.66` → **false**, should not. With `total_votes = 99, yes_votes = 99` (100% yes, short of quorum) → **false**, should not, since `total_votes >= 100` fails first. State plainly whether the trigger's actual SQL (`total_votes >= 100 and yes_votes::numeric / total_votes >= 0.66`) produces these three results — this can be verified by reading the SQL alone, no live data needed.
3. **Do not** attempt to lower the quorum constant to make live testing easier, in the deployed migration or otherwise — the committed migration's quorum must stay at 100 exactly as designed. If deeper live proof is wanted later, that's a decision for the human to make explicitly, not something to do unprompted.

- [ ] **Step 4: Manual QA checklist (human, live production site)**

1. Open a post that has met the 4 real gates (or work with the human to identify/create one — this may require a post with substantial real upvotes/validations already accumulated from Phase 1 testing).
2. Cast a tokenization vote (YES or NO) as a real logged-in user; confirm the vote tally updates and persists across a refresh.
3. Confirm a post that is NOT yet tokenized shows the voting UI, not the "TOKEN CREATED" state.
4. For a token that exists (either from reaching real quorum, or any pre-existing test data), open the Market page and confirm it lists the real token with a real price derived from real supply.
5. Buy a small quantity as one user; confirm the Market price updates, the purchase appears in that user's Portfolio tab, and refreshing in a second browser/incognito session shows the updated supply/price too (proving it's real and shared, not local).

## Explicitly not covered by this plan

Wallet balance/deposits/withdrawals remain exactly as they were before this phase (local-only, unlimited, fake) — Phase 3's job. Citation tracking, server-side gate re-verification before a tokenize vote, and server-side purchase-cost validation are all explicitly deferred per the approved spec, not addressed here.
