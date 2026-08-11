# VERIDAX Wallet Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake, per-browser wallet with a real, shared Supabase ledger, and fix the previously-fake "author commission" claim so purchases genuinely, atomically debit the buyer and credit the token's author.

**Architecture:** Continues the established pattern exactly — React app talks directly to Supabase via `supabase-js`, RLS enforces access, balance is always derived client-side from immutable ledger rows. One new twist: `wallet_transactions` is the first *privately*-scoped table (`select` restricted to `auth.uid() = user_id`), unlike every public table so far.

**Tech Stack:** React 19, Vite, Supabase (Postgres + RLS + a `security definer` trigger), Vitest.

**Spec:** `docs/superpowers/specs/2026-08-10-wallet-integrity-design.md`

---

### Task 1: Write the wallet integrity database migration

**Files:**
- Create: `supabase/migrations/0003_wallet.sql`

- [ ] **Step 1: Write the migration script**

```sql
-- VERIDAX Phase 3 (Wallet Integrity): wallet_transactions ledger + real commission routing.

-- wallet_transactions -----------------------------------------------------
create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  type text not null check (type in ('deposit', 'withdraw', 'buy', 'commission')),
  amount numeric not null check (
    (type in ('deposit', 'commission') and amount >= 0) or
    (type in ('withdraw', 'buy') and amount <= 0)
  ),
  method text,
  purchase_id uuid references public.token_purchases(id),
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create index wallet_transactions_user_id_idx on public.wallet_transactions(user_id);

create policy "users can view only their own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

create policy "users can insert their own deposit/withdraw transactions"
  on public.wallet_transactions for insert
  with check (auth.uid() = user_id and type in ('deposit', 'withdraw'));

-- Deliberately no insert policy allows 'buy' or 'commission' rows for
-- ordinary users — only the handle_token_purchase trigger below (security
-- definer) may create those, guaranteeing every buy/commission row traces
-- back to a real token_purchases row. No update/delete policy at all.

-- token_purchases: add commission column -----------------------------------
alter table public.token_purchases
  add column commission numeric not null default 0 check (commission >= 0);

alter table public.token_purchases
  add constraint commission_not_more_than_cost check (commission <= cost);

-- auto-ledger trigger --------------------------------------------------------
-- Fires after every real token purchase. Atomically, entirely server-side:
-- debits the buyer for the full cost, then credits the post's author with
-- the commission. The client's purchase action never directly touches its
-- own or anyone else's ledger row — the trigger is the only path in.
create or replace function public.handle_token_purchase()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  post_author_id uuid;
begin
  insert into public.wallet_transactions (user_id, type, amount, purchase_id)
  values (new.user_id, 'buy', -new.cost, new.id);

  select author_id into post_author_id from public.posts where id = new.post_id;

  if post_author_id is not null and new.commission > 0 then
    insert into public.wallet_transactions (user_id, type, amount, purchase_id)
    values (post_author_id, 'commission', new.commission, new.id);
  end if;

  return new;
end;
$$;

create trigger on_token_purchase
  after insert on public.token_purchases
  for each row execute function public.handle_token_purchase();
```

- [ ] **Step 2: Run it against the Supabase project**

This step requires the human's Supabase dashboard access, which you do not
have. Do not attempt to run this yourself. Just write the file and commit
it — flag to the coordinating agent that this should likely run early
(before later tasks), same as Phase 2's migration, so live verification is
possible throughout implementation.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0003_wallet.sql
git commit -m "Add Phase 3 database migration: wallet_transactions ledger + commission trigger"
```

## Before Reporting Back: Self-Review (do this carefully — nobody will run this SQL before your review completes)

- Is RLS explicitly enabled on `wallet_transactions`? Without it, the
  policies are decorative.
- Is the `select` policy genuinely restricted to `auth.uid() = user_id`
  (not `using (true)` like every other table so far)? This table is
  deliberately private — double check you didn't copy the public-select
  pattern by habit.
- Does the `insert` policy's `type in (...)` genuinely exclude `'buy'` and
  `'commission'`? Trace through: can an ordinary authenticated user, via
  the anon/authenticated Postgres role, insert a row with
  `type = 'commission'` and their own `user_id`? It must be structurally
  impossible, not just discouraged.
- Does the trigger correctly compute `post_author_id` from `posts` via
  `new.post_id`, not from `token_purchases` directly (which has no author
  column)?
- Does the amount-sign check constraint correctly allow `0` on both sides
  (so a theoretical $0 purchase, already permitted by `token_purchases`'s
  existing `cost >= 0` constraint, doesn't get rejected by this trigger and
  roll back the whole purchase)?
- Is `commission <= cost` enforced as a real constraint, not just
  documented as a convention?
- Is the trigger function `security definer` with a pinned
  `search_path = public` (same pattern as Phase 2's tokenize trigger, to
  avoid search-path hijacking)?

---

### Task 2: Build the wallet data-access layer

**Files:**
- Create: `src/lib/wallet.js`
- Create: `src/lib/wallet.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/wallet.test.js`:
```js
import { describe, it, expect } from "vitest";
import { aggregateWallet } from "./wallet";

describe("aggregateWallet", () => {
  it("sums deposits and commission credits as positive, withdrawals and buys as negative", () => {
    const transactions = [
      { type: "deposit", amount: 100 },
      { type: "buy", amount: -30 },
      { type: "commission", amount: 5 },
      { type: "withdraw", amount: -20 },
    ];
    const { balance } = aggregateWallet(transactions);
    expect(balance).toBe(55);
  });

  it("returns a balance of 0 for an empty transaction list", () => {
    const { balance } = aggregateWallet([]);
    expect(balance).toBe(0);
  });

  it("handles a single deposit", () => {
    const { balance } = aggregateWallet([{ type: "deposit", amount: 42.5 }]);
    expect(balance).toBe(42.5);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/wallet.js` does not exist yet.

- [ ] **Step 3: Write `src/lib/wallet.js`**

```js
import { supabase } from "./supabaseClient";

export async function fetchWalletTransactions() {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, user_id, type, amount, method, purchase_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function depositFunds({ userId, amount, method }) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .insert({ user_id: userId, type: "deposit", amount, method })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function withdrawFunds({ userId, amount }) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .insert({ user_id: userId, type: "withdraw", amount: -amount })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat wallet_transactions array (as returned by
// fetchWalletTransactions) into the user's current balance — always the
// sum of every row's amount, never stored as a mutable counter.
export function aggregateWallet(transactions) {
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  return { balance };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `wallet.test.js` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wallet.js src/lib/wallet.test.js
git commit -m "Add wallet data-access layer with tested balance aggregation"
```

**Context:** Eighth `src/lib/` module, mirroring the established shape:
thin, untested fetch/insert wrappers plus one pure, fully-tested aggregation
function. Note `fetchWalletTransactions` takes no `userId` parameter — RLS
already restricts results to the caller's own rows, so there is nothing to
filter by client-side (unlike `fetchProfile(userId)`, which looks up a
specific *other* user's public profile). `withdrawFunds` negates `amount`
before inserting so the stored row is always negative, matching the sign
convention the migration's check constraint enforces.

---

### Task 3: Add commission to the purchase data-access layer

**Files:**
- Modify: `src/lib/market.js`

- [ ] **Step 1: Update `buyToken` to accept and persist `commission`**

Find:
```js
export async function buyToken({ postId, userId, qty, cost }) {
  const { data, error } = await supabase
    .from("token_purchases")
    .insert({ post_id: postId, user_id: userId, qty, cost })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```
Replace with:
```js
export async function buyToken({ postId, userId, qty, cost, commission }) {
  const { data, error } = await supabase
    .from("token_purchases")
    .insert({ post_id: postId, user_id: userId, qty, cost, commission })
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Run tests to verify nothing broke**

Run: `npm run test`
Expected: PASS — `market.test.js`'s `aggregateMarket` tests are unaffected
(they never touch `commission`); this step only changes the untested
`buyToken` wrapper.

- [ ] **Step 3: Commit**

```bash
git add src/lib/market.js
git commit -m "Persist commission amount on token purchases"
```

**Context:** `commission` is the dollar amount of commission for this
specific purchase, computed client-side by `BuyModal` (Task 6) exactly as
the app already displays it today (`cost * token.commission / 100`), now
persisted instead of thrown away. The Postgres trigger from Task 1 reads
this column to credit the author — it does not recompute it.

---

### Task 4: Wire real wallet data into App.jsx

**Files:**
- Modify: `src/App.jsx` (imports, state block, a new dedicated data effect, handlers, two render call sites)

- [ ] **Step 1: Add imports**

Find:
```js
import { fetchTokens, fetchPurchases, buyToken as recordTokenPurchase, aggregateMarket } from "./lib/market";
```
Add one line after it:
```js
import { fetchWalletTransactions, depositFunds, withdrawFunds, aggregateWallet } from "./lib/wallet";
```

- [ ] **Step 2: Remove the old local `balance`/`transactions` state and their localStorage effects**

Find:
```js
  const [balance,      setBalance]      = useState(() => LS.get('vdx_balance', 0));
  const [transactions, setTransactions] = useState(() => LS.get('vdx_transactions', []));
  useEffect(() => LS.set('vdx_balance', balance), [balance]);
  useEffect(() => LS.set('vdx_transactions', transactions), [transactions]);

  const totalValidations = Object.values(postVotes).reduce((s,v) => s + Object.values(v).reduce((a,b) => a+b, 0), 0);

  const addTx = (type, amount, desc) => {
    setTransactions(prev => [{
      id: `tx_${Date.now()}`,
      type, amount, desc,
      date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
    }, ...prev]);
  };

  const handleDeposit = (amount, method) => {
    setBalance(prev => prev + amount);
    addTx("deposit", amount, `Deposit via ${method}`);
  };

  const handleWithdraw = (amount) => {
    setBalance(prev => prev - amount);
    addTx("withdraw", -amount, "Withdrawal to wallet");
  };
```
Replace with:
```js
  const totalValidations = Object.values(postVotes).reduce((s,v) => s + Object.values(v).reduce((a,b) => a+b, 0), 0);

  const { balance } = aggregateWallet(rawWalletTx);

  const transactions = rawWalletTx.map(tx => {
    const date = new Date(tx.created_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
    if (tx.type === "deposit") {
      return { id: tx.id, type: "deposit", amount: tx.amount, desc: `Deposit via ${tx.method || "unknown method"}`, date };
    }
    if (tx.type === "withdraw") {
      return { id: tx.id, type: "withdraw", amount: tx.amount, desc: "Withdrawal to wallet", date };
    }
    const purchase = rawPurchases.find(p => p.id === tx.purchase_id);
    const purchaseToken = purchase ? tokens.find(t => t.postId === purchase.post_id) : null;
    const sym = purchaseToken?.sym || "?";
    if (tx.type === "buy") {
      return { id: tx.id, type: "buy", amount: tx.amount, desc: `Bought ${(purchase?.qty || 0).toLocaleString()} × ⬡ ${sym}`, date };
    }
    return { id: tx.id, type: "commission", amount: tx.amount, desc: `Commission from ⬡ ${sym}`, date };
  });

  const handleDeposit = async (amount, method) => {
    if (!user) return;
    const tx = await depositFunds({ userId: user.id, amount, method });
    setRawWalletTx(prev => [tx, ...prev]);
  };

  const handleWithdraw = async (amount) => {
    if (!user) return;
    const tx = await withdrawFunds({ userId: user.id, amount });
    setRawWalletTx(prev => [tx, ...prev]);
  };
```

(`balance` and `transactions` keep their exact old names on purpose — both
render call sites already pass `balance={balance}` /
`transactions={transactions}` as props, so this substitution alone makes
them real without touching either call site, the same trick Phase 2 used
for `portfolio`.)

- [ ] **Step 3: Add the `rawWalletTx` state declaration**

Find:
```js
  const [rawPurchases,     setRawPurchases]     = useState([]);
```
Add one line after it:
```js
  const [rawWalletTx,      setRawWalletTx]      = useState([]);
```

- [ ] **Step 4: Add a dedicated wallet-transactions effect, keyed on the logged-in user**

`wallet_transactions` is the first *privately*-scoped table — unlike posts/
votes/tokens/purchases, it must not be fetched until a real session exists,
and it must be re-fetched (or cleared) whenever the logged-in user changes.
Folding it into the existing anonymous-safe mount `Promise.all(...)` would
be wrong: that effect fires before the separate auth effect necessarily
resolves, so an early fetch could silently return an empty array even for
an already-logged-in user.

Find the auth effect (for placement — add the new effect immediately
after it):
```js
  useEffect(() => {
    let active = true;
    const loadUserFromSession = async (session) => {
      if (!session) { if (active) setUser(null); return; }
      try {
        const profile = await fetchProfile(session.user.id);
        if (active) setUser(toAppUser(session, profile));
      } catch (err) {
        console.error("Failed to load profile for session:", err);
        if (active) setUser(null);
      }
    };
    getSession()
      .then(session => loadUserFromSession(session))
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setAuthLoading(false); });
    const unsubscribe = onAuthStateChange(loadUserFromSession);
    return () => { active = false; unsubscribe(); };
  }, []);
```
Add immediately after it:
```js
  // wallet_transactions is privately scoped (RLS: auth.uid() = user_id),
  // so it can only be fetched once we know who's logged in — and must be
  // re-fetched (or cleared) whenever that identity changes.
  useEffect(() => {
    let active = true;
    if (!user) { setRawWalletTx([]); return; }
    (async () => {
      try {
        const tx = await fetchWalletTransactions();
        if (active) setRawWalletTx(tx);
      } catch (err) {
        console.error("Failed to load wallet transactions:", err);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);
```

- [ ] **Step 5: Update `handleBuyToken`**

Find:
```js
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
Replace with:
```js
  const handleBuyToken = async (postId, qty, cost, commission) => {
    if (!user) return;
    const purchase = await recordTokenPurchase({ postId, userId: user.id, qty, cost, commission });
    setRawPurchases(prev => [...prev, purchase]);
    const refreshedWalletTx = await fetchWalletTransactions();
    setRawWalletTx(refreshedWalletTx);
  };
```

(A full re-fetch here, not an append: the trigger from Task 1 creates the
buyer's debit row server-side as a side effect of the purchase insert, so
the client has no local copy of that row to append — the same
re-fetch-after-server-side-side-effect pattern already used for
`handleTokenizeVote`.)

- [ ] **Step 6: Update the two render call sites**

Find:
```jsx
      {buyToken && <BuyModal token={buyToken} user={user} balance={balance} onClose={() => setBuyTokenSym(null)} onBought={(qty, cost) => handleBuyToken(buyToken.postId, qty, cost)} onNeedDeposit={() => setShowProfile(true)}/>}
```
Replace with:
```jsx
      {buyToken && <BuyModal token={buyToken} user={user} balance={balance} onClose={() => setBuyTokenSym(null)} onBought={(qty, cost, commission) => handleBuyToken(buyToken.postId, qty, cost, commission)} onNeedDeposit={() => setShowProfile(true)}/>}
```

The `DashboardSidebar` render call site needs **no change** — it already
passes `balance={balance}` `transactions={transactions}`
`onDeposit={handleDeposit}` `onWithdraw={handleWithdraw}`, and all four
names are unchanged.

- [ ] **Step 7: Sanity check**

Run: `npm run build` — will NOT fully succeed yet, because `BuyModal`
(Task 6) hasn't been updated to pass a third `commission` argument, and
`DashboardSidebar` (Task 5) hasn't been updated to handle async
deposit/withdraw errors yet. Confirm any errors are confined to those two
components, not this task's own edits.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "Wire real wallet ledger into App.jsx"
```

---

### Task 5: Make DashboardSidebar's wallet actions genuinely async

**Files:**
- Modify: `src/App.jsx` (the `DashboardSidebar` component only — state, `confirmWalletAction`, one new error banner)

- [ ] **Step 1: Add `walletError` state**

Find:
```js
  const [walletWorking,   setWalletWorking]   = useState(false);
  const [walletDone,      setWalletDone]      = useState(false);
```
Replace with:
```js
  const [walletWorking,   setWalletWorking]   = useState(false);
  const [walletDone,      setWalletDone]      = useState(false);
  const [walletError,     setWalletError]     = useState("");
```

- [ ] **Step 2: Rewrite `confirmWalletAction` to genuinely await the real network call**

Find:
```js
  const confirmWalletAction = () => {
    const amt = parseFloat(walletAmount);
    if (!amt || amt <= 0) return;
    if (walletMode === "withdraw" && amt > (balance || 0)) return;
    setWalletWorking(true);
    setTimeout(() => {
      if (walletMode === "deposit") onDeposit(amt, depositMethod);
      else onWithdraw(amt);
      setWalletWorking(false);
      setWalletDone(true);
      setWalletAmount("");
      setTimeout(() => { setWalletDone(false); setWalletMode(null); }, 2400);
    }, 2000);
  };
```
Replace with:
```js
  const confirmWalletAction = async () => {
    const amt = parseFloat(walletAmount);
    if (!amt || amt <= 0) return;
    if (walletMode === "withdraw" && amt > (balance || 0)) return;
    setWalletWorking(true);
    setWalletError("");
    try {
      if (walletMode === "deposit") await onDeposit(amt, depositMethod);
      else await onWithdraw(amt);
      setWalletWorking(false);
      setWalletDone(true);
      setWalletAmount("");
      setTimeout(() => { setWalletDone(false); setWalletMode(null); }, 2400);
    } catch (err) {
      setWalletWorking(false);
      setWalletError(err.message || "Something went wrong. Please try again.");
    }
  };
```

(The old fixed 2000ms `setTimeout` was simulating network latency — now
there's real latency to wait on, so the fake delay is removed, the same
kind of fix already applied to `BuyModal` in Phase 2.)

- [ ] **Step 3: Add the error banner**

Find:
```jsx
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={confirmWalletAction}
                          disabled={!parseFloat(walletAmount) || parseFloat(walletAmount) <= 0 || (walletMode==="withdraw" && parseFloat(walletAmount) > (balance||0))}
```
Replace with:
```jsx
                      {walletError && (
                        <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:9,fontFamily:"monospace",color:C.bloom}}>
                          ✕ {walletError}
                        </div>
                      )}
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={confirmWalletAction}
                          disabled={!parseFloat(walletAmount) || parseFloat(walletAmount) <= 0 || (walletMode==="withdraw" && parseFloat(walletAmount) > (balance||0))}
```

- [ ] **Step 4: Sanity check and commit**

Run: `npm run build` — must succeed.
Run: `npm run test` — all tests must still pass.

```bash
git add src/App.jsx
git commit -m "Make wallet deposit/withdraw genuinely async with real error handling"
```

---

### Task 6: Make BuyModal compute and send the real commission amount

**Files:**
- Modify: `src/App.jsx` (the `BuyModal` component only — one new derived value, `handleBuy`'s call to `onBought`)

- [ ] **Step 1: Compute the commission dollar amount and pass it through**

Find:
```js
  const sufficientBalance = (balance || 0) >= totalCost;

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
Replace with:
```js
  const sufficientBalance = (balance || 0) >= totalCost;
  const commissionAmount = totalCost * token.commission / 100;

  const handleBuy = async () => {
    if (!user || buying || bought || !sufficientBalance) return;
    setBuying(true);
    setBuyError("");
    try {
      if (onBought) await onBought(qty, totalCost, commissionAmount);
      setRecord({ qty, cost: totalCost, newSupply: token.supply + qty, newPrice: bondingPrice(token.supply + qty) });
      setBought(true);
    } catch (err) {
      setBuyError(err.message || "Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };
```

(The success screen's existing display line — `${(record.cost *
token.commission / 100).toFixed(2)} auto-routed` — already computes this
same value independently for display and needs no change; it's now
finally describing something that actually happened.)

- [ ] **Step 2: Sanity check**

Run: `npm run build` — should now fully succeed (this was the source of
the errors noted at the end of Task 4).
Run: `npm run test` — all tests (scoring, votes, tokenizeVotes, market,
wallet) must pass.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "Send real commission amount when buying tokens"
```

---

### Task 7: Deploy migration and run end-to-end QA

**Files:** none (configuration + manual/scripted verification)

- [ ] **Step 1: Human runs the migration**

Give the human the contents of `supabase/migrations/0003_wallet.sql` to
paste into their Supabase project's SQL Editor and run. Confirm "Success.
No rows returned," and that `wallet_transactions` appears in Table Editor
with RLS enabled, and that `token_purchases` now has a `commission` column.

- [ ] **Step 2: Deploy**

Once merged to `main` and pushed, trigger a fresh Vercel deploy (no new env
vars needed). Verify the deployed bundle is the real one, the same way
Phase 2 confirmed it — compare the served `/assets/index-*.js` hash against
a fresh local build, and grep the live bundle for something specific to
this phase (e.g. the wallet error-banner strings) to confirm it isn't a
stale cache.

- [ ] **Step 3: Verify the commission trigger correctness**

1. **Live proof via two real accounts**: sign in as a real user with an
   existing published, tokenized post (or use the QA process from Phase 2
   to get one to that state), and as a second real user, buy a small
   quantity of that post's token. Confirm: the buyer's own
   `wallet_transactions` (queried by signing in as them) shows a new `buy`
   row with `amount = -cost`; the author's own `wallet_transactions`
   (queried by signing in as them) shows a new `commission` row with
   `amount` equal to the commission persisted on the `token_purchases` row.
   Because this table is private, this requires signing in as each side in
   turn — a public anon read (Phase 2's verification method) will not work
   here and should not be attempted as a shortcut.
2. **Confirm RLS actually blocks a commission self-insert**: while signed
   in as any real user, attempt
   `supabase.from('wallet_transactions').insert({ user_id: <self>, type:
   'commission', amount: 999 })` directly. This must be rejected by RLS
   (not merely "the UI doesn't expose a button for it") — report the exact
   error.
3. **Confirm deposit/withdraw persistence**: as a real logged-in user,
   deposit a small amount, then reload the page (or sign in from a second
   browser/incognito session). Confirm the new balance is visible in both
   places — proving it's a real, shared, persisted number and not
   localStorage.

- [ ] **Step 4: Manual QA checklist (human, live production site)**

1. Log in, open the Wallet tab, deposit a small amount, confirm the
   balance updates and the transaction appears with the correct method
   label.
2. Withdraw a smaller amount, confirm balance updates correctly.
3. Buy a small quantity of an existing tokenized post's token (as a
   different account than the post's author). Confirm: the buyer's balance
   drops by the total cost, a "Bought ..." transaction appears for the
   buyer.
4. Log in as the token's author (or have a second person do so). Confirm a
   "Commission from ..." transaction appears with the correct amount, and
   their balance reflects it — without them having done anything
   themselves.
5. Confirm the transaction list's labels render correctly for all four
   transaction types (deposit/withdraw/buy/commission) — no "undefined" or
   broken lookups.

## Explicitly not covered by this plan

Any real payment processor, real payouts, KYC, or tax reporting — deferred
to a future, not-yet-scoped "Real Payments" phase. Overdraft prevention on
withdrawals is an explicitly accepted trust boundary, not a bug to fix
here. Category proposals remain unchanged, still later.
