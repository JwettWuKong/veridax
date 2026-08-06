# VERIDAX Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-browser localStorage simulation of accounts, posts, and validation with a real Supabase-backed system, so different users on different devices actually see each other's published work and votes.

**Architecture:** React app talks directly to Supabase (Postgres + Auth) via `supabase-js`, with Row Level Security enforcing who can read/write what — no custom API server. A small `src/lib/` data layer isolates Supabase calls from the existing single-file `src/App.jsx` UI.

**Tech Stack:** React 19, Vite, `@supabase/supabase-js`, Postgres (via Supabase), Vitest (unit tests for pure functions).

**Spec:** `docs/superpowers/specs/2026-08-06-backend-foundation-design.md`

---

## Before you start

This plan assumes a Supabase project does not exist yet. Task 3 has you (a human) create one — no tool can do this step for you.

---

### Task 1: Add dependencies and test tooling

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Add `@supabase/supabase-js` and `vitest` to `package.json`**

Current `package.json`:
```json
{
  "name": "veridex",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "vite": "^8.0.10"
  }
}
```

Replace with:
```json
{
  "name": "veridex",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "vite": "^8.0.10",
    "vitest": "^2.1.4"
  }
}
```

- [ ] **Step 2: Add a `test` block to `vite.config.js` so Vitest reuses it**

Current `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

Replace with:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Install and verify**

Run: `npm install`
Expected: `@supabase/supabase-js` and `vitest` appear in `node_modules`, `package-lock.json` updates.

Run: `npm run test`
Expected: Vitest runs and reports "No test files found" (no `*.test.js` files exist yet) — this confirms the runner itself works before any tests are written.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "Add Supabase client and Vitest dependencies"
```

---

### Task 2: Extract scoring functions into a testable module

**Files:**
- Create: `src/lib/scoring.js`
- Create: `src/lib/scoring.test.js`
- Modify: `src/App.jsx:1`, `src/App.jsx:129-163`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scoring.test.js`:
```js
import { describe, it, expect } from "vitest";
import { shannonDiversity, calcTrustScore, checkGates } from "./scoring";

describe("shannonDiversity", () => {
  it("returns 0 when there are no votes", () => {
    expect(shannonDiversity({})).toBe(0);
  });

  it("returns close to 1 when votes are spread evenly across all 8 clusters", () => {
    const even = { scientific:10, civil:10, independent:10, tech:10, grassroots:10, academic:10, journalism:10, legal:10 };
    expect(shannonDiversity(even)).toBeCloseTo(1, 5);
  });

  it("returns 0 when all votes come from a single cluster", () => {
    expect(shannonDiversity({ scientific: 500 })).toBe(0);
  });
});

describe("calcTrustScore", () => {
  it("returns 0 when there are no votes or disputes", () => {
    expect(calcTrustScore({}, {})).toBe(0);
  });

  it("scores evenly-spread validations higher than single-cluster validations at the same volume", () => {
    const spread = { scientific:625, civil:625, independent:625, tech:625, grassroots:625, academic:625, journalism:625, legal:625 };
    const concentrated = { scientific: 5000 };
    expect(calcTrustScore(spread, {})).toBeGreaterThan(calcTrustScore(concentrated, {}));
  });

  it("lowers the score as disputes make up a larger share of total votes", () => {
    const votes = { scientific: 100 };
    const noDisputes = calcTrustScore(votes, {});
    const someDisputes = calcTrustScore(votes, { civil: 100 });
    expect(someDisputes).toBeLessThan(noDisputes);
  });
});

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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/scoring.js` does not exist yet.

- [ ] **Step 3: Create `src/lib/scoring.js` with the extracted logic**

```js
export const nf = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

export function shannonDiversity(counts) {
  const vals = Object.values(counts);
  const total = vals.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const H = vals.filter(v => v > 0).reduce((s, v) => { const p = v / total; return s - p * Math.log2(p); }, 0);
  return H / Math.log2(8);
}

export function calcTrustScore(ups, disps) {
  const totalUp = Object.values(ups).reduce((s, v) => s + v, 0);
  const totalDisp = Object.values(disps).reduce((s, v) => s + v, 0);
  const total = totalUp + totalDisp;
  if (total === 0) return 0;
  return 0.65 * (totalUp / total) + 0.35 * shannonDiversity(ups);
}

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

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `scoring.test.js` tests green.

- [ ] **Step 5: Point `App.jsx` at the extracted module**

Modify `src/App.jsx:1` — current:
```js
import { useState, useEffect, useRef } from "react";
```
Replace with:
```js
import { useState, useEffect, useRef } from "react";
import { nf, shannonDiversity, calcTrustScore, TOKEN_GATES, checkGates } from "./lib/scoring";
```

Modify `src/App.jsx:129-163` — delete this entire block (it now lives in `src/lib/scoring.js`):
```js
const nf = n => n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1e3?`${(n/1e3).toFixed(1)}K`:`${n}`;


function shannonDiversity(counts) {
  const vals = Object.values(counts);
  const total = vals.reduce((s,v) => s+v, 0);
  if (total === 0) return 0;
  const H = vals.filter(v => v > 0).reduce((s,v) => { const p = v/total; return s - p * Math.log2(p); }, 0);
  return H / Math.log2(8);
}

function calcTrustScore(ups, disps) {
  const totalUp = Object.values(ups).reduce((s,v) => s+v, 0);
  const totalDisp = Object.values(disps).reduce((s,v) => s+v, 0);
  const total = totalUp + totalDisp;
  if (total === 0) return 0;
  return 0.65 * (totalUp / total) + 0.35 * shannonDiversity(ups);
}

const TOKEN_GATES = { upvotes:10000, citations:200, validations:2500, diversity:0.72, trustScore:0.88 };

function checkGates(post, votes, disputes) {
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

(Leave `function bondingPrice(supply) {` — the next line after this block — and everything below it untouched. Tokenization/market logic is Phase 2.)

- [ ] **Step 6: Verify the app still runs**

Run: `npm run dev`, open the app, confirm the homepage and Discover page render post cards with trust scores/gate progress as before (no visual change expected).

- [ ] **Step 7: Commit**

```bash
git add src/lib/scoring.js src/lib/scoring.test.js src/App.jsx
git commit -m "Extract scoring functions into tested src/lib/scoring.js"
```

---

### Task 3: Create the Supabase project and local env config

**Files:**
- Create: `.env.example`
- Create: `src/lib/supabaseClient.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create a Supabase project (manual, one-time)**

Go to https://supabase.com, sign in/sign up, create a new project (any name/region). Once it's provisioned:
1. In the dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Go to **Authentication → Providers → Email** and confirm "Confirm email" is **enabled** (it is by default).

- [ ] **Step 2: Add `.env` to `.gitignore`**

Current `.gitignore` (relevant section):
```
node_modules
dist
dist-ssr
*.local
```
Replace with:
```
node_modules
dist
dist-ssr
*.local
.env
```

- [ ] **Step 3: Create `.env.example`**

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

- [ ] **Step 4: Create your local `.env` (not committed)**

Copy `.env.example` to `.env` and fill in the real values from Step 1.

- [ ] **Step 5: Create `src/lib/supabaseClient.js`**

```js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore src/lib/supabaseClient.js
git commit -m "Add Supabase client config"
```

(`.env` itself is never committed — it's gitignored.)

---

### Task 4: Write the database migration

**Files:**
- Create: `supabase/migrations/0001_foundation.sql`

- [ ] **Step 1: Write the migration script**

```sql
-- VERIDAX Phase 1 (Foundation): profiles, posts, votes.

-- profiles ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  field text,
  cluster text,
  credentials jsonb not null default '[]'::jsonb,
  joined_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- posts --------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  cat text not null,
  title text not null,
  body text not null,
  summary text not null,
  evidence_links jsonb not null default '[]'::jsonb,
  flagship boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts are publicly readable"
  on public.posts for select
  using (true);

create policy "users can publish their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

-- votes -------------------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id),
  user_id uuid not null references public.profiles(id),
  cluster text not null,
  type text not null check (type in ('up', 'dispute')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.votes enable row level security;

create policy "votes are publicly readable"
  on public.votes for select
  using (true);

create policy "users can cast their own vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

-- profile-creation trigger --------------------------------------------------
-- Fires the moment someone signs up (even before they confirm their email),
-- reading the signup form data out of Supabase's user_metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, field, cluster, credentials)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'field',
    new.raw_user_meta_data->>'cluster',
    coalesce(new.raw_user_meta_data->'credentials', '[]'::jsonb)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Run it against the Supabase project**

In the Supabase dashboard, go to **SQL Editor → New query**, paste the script above, and run it. Expected: "Success. No rows returned." Then check **Table Editor** — `profiles`, `posts`, and `votes` should all exist.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/0001_foundation.sql
git commit -m "Add Phase 1 database migration: profiles, posts, votes"
```

---

### Task 5: Build the auth data-access layer

**Files:**
- Create: `src/lib/auth.js`

- [ ] **Step 1: Write `src/lib/auth.js`**

```js
import { supabase } from "./supabaseClient";

// Creates a new Supabase Auth user and attaches profile fields as
// user_metadata; the `handle_new_user` trigger turns that into a real
// `profiles` row immediately (even before the email is confirmed).
export async function signUp({ email, password, username, cluster, field, credentials }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, cluster, field, credentials: credentials || [] },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, field, cluster, credentials, joined_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// Total registered users, for the "EXPERTS"/"CONTRIBUTORS" stat displays
// (previously `accounts.length` against the fake local accounts array).
export async function fetchProfileCount() {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Subscribes to sign-in/sign-out/token-refresh events. Returns an
// unsubscribe function.
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}

// Shapes a Supabase session + profiles row into the flat `user` object
// the rest of App.jsx already expects (same shape the old localStorage
// account objects had), so downstream components don't need to change.
export function toAppUser(session, profile) {
  return {
    id: profile.id,
    email: session.user.email,
    username: profile.username,
    cluster: profile.cluster,
    field: profile.field,
    credentials: profile.credentials || [],
    joined: new Date(profile.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    pohMethod: null, // Proof of Humanity is deferred to a later phase.
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.js
git commit -m "Add Supabase auth data-access layer"
```

(No automated tests here — every function is a thin wrapper around a live network call to Supabase Auth, which the approved spec scopes to manual QA rather than mocked unit tests.)

---

### Task 6: Build the posts data-access layer

**Files:**
- Create: `src/lib/posts.js`

- [ ] **Step 1: Write `src/lib/posts.js`**

```js
import { supabase } from "./supabaseClient";

const SELECT_COLUMNS = "id, author_id, cat, title, body, summary, evidence_links, flagship, created_at, profiles(username, field)";

export async function fetchPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPost({ authorId, cat, title, body, summary, evidenceLinks, flagship }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      cat,
      title,
      body,
      summary,
      evidence_links: evidenceLinks || [],
      flagship: !!flagship,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/posts.js
git commit -m "Add posts data-access layer"
```

---

### Task 7: Build the votes data-access layer

**Files:**
- Create: `src/lib/votes.js`
- Create: `src/lib/votes.test.js`

- [ ] **Step 1: Write the failing tests for the pure aggregation function**

Create `src/lib/votes.test.js`:
```js
import { describe, it, expect } from "vitest";
import { aggregateVotes } from "./votes";

describe("aggregateVotes", () => {
  const rows = [
    { post_id: "p1", user_id: "u1", cluster: "scientific", type: "up" },
    { post_id: "p1", user_id: "u2", cluster: "civil", type: "up" },
    { post_id: "p1", user_id: "u3", cluster: "tech", type: "dispute" },
    { post_id: "p2", user_id: "u1", cluster: "academic", type: "up" },
  ];

  it("buckets up-votes into postVotes by post and cluster", () => {
    const { postVotes } = aggregateVotes(rows, null);
    expect(postVotes.p1).toEqual({ scientific: 1, civil: 1 });
    expect(postVotes.p2).toEqual({ academic: 1 });
  });

  it("buckets disputes into postDisputes by post and cluster", () => {
    const { postDisputes } = aggregateVotes(rows, null);
    expect(postDisputes.p1).toEqual({ tech: 1 });
    expect(postDisputes.p2).toBeUndefined();
  });

  it("counts total up-votes per post", () => {
    const { upCounts } = aggregateVotes(rows, null);
    expect(upCounts.p1).toBe(2);
    expect(upCounts.p2).toBe(1);
  });

  it("reports the given user's own vote per post in userVotes", () => {
    const { userVotes } = aggregateVotes(rows, "u1");
    expect(userVotes.p1).toBe("up");
    expect(userVotes.p2).toBe("up");
  });

  it("omits posts the given user hasn't voted on from userVotes", () => {
    const { userVotes } = aggregateVotes(rows, "u2");
    expect(userVotes.p2).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `src/lib/votes.js` does not exist yet.

- [ ] **Step 3: Write `src/lib/votes.js`**

```js
import { supabase } from "./supabaseClient";

export async function fetchVotes() {
  const { data, error } = await supabase
    .from("votes")
    .select("id, post_id, user_id, cluster, type, created_at");
  if (error) throw error;
  return data;
}

export async function castVote({ postId, userId, cluster, type }) {
  const { data, error } = await supabase
    .from("votes")
    .insert({ post_id: postId, user_id: userId, cluster, type })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat votes array (as returned by fetchVotes) into the
// shapes the existing scoring functions and UI already expect:
//   postVotes:    { [postId]: { [clusterId]: count } }   (type === 'up')
//   postDisputes: { [postId]: { [clusterId]: count } }   (type === 'dispute')
//   userVotes:    { [postId]: 'up' | 'dispute' }          (for the given userId)
//   upCounts:     { [postId]: number }                    (total 'up' votes per post)
export function aggregateVotes(votes, userId) {
  const postVotes = {};
  const postDisputes = {};
  const userVotes = {};
  const upCounts = {};
  for (const v of votes) {
    const bucket = v.type === "up" ? postVotes : postDisputes;
    bucket[v.post_id] = bucket[v.post_id] || {};
    bucket[v.post_id][v.cluster] = (bucket[v.post_id][v.cluster] || 0) + 1;
    if (v.type === "up") {
      upCounts[v.post_id] = (upCounts[v.post_id] || 0) + 1;
    }
    if (userId && v.user_id === userId) {
      userVotes[v.post_id] = v.type;
    }
  }
  return { postVotes, postDisputes, userVotes, upCounts };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS — all `votes.test.js` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/votes.js src/lib/votes.test.js
git commit -m "Add votes data-access layer with tested aggregation"
```

---

### Task 8: Wire real authentication into App.jsx

**Files:**
- Modify: `src/App.jsx:1-2`, `src/App.jsx:2482-2589`

- [ ] **Step 1: Import the new auth functions**

Modify `src/App.jsx:2` (added in Task 2) — current:
```js
import { nf, shannonDiversity, calcTrustScore, TOKEN_GATES, checkGates } from "./lib/scoring";
```
Replace with:
```js
import { nf, shannonDiversity, calcTrustScore, TOKEN_GATES, checkGates } from "./lib/scoring";
import { signUp, signIn, signOut, fetchProfile, fetchProfileCount, getSession, onAuthStateChange, toAppUser } from "./lib/auth";
```

- [ ] **Step 2: Replace localStorage-based session/account state**

Modify `src/App.jsx:2482-2489` — current:
```js
export default function Veridax() {
  const [section, setSection] = useState("home");
  const [user, setUser]             = useState(() => LS.get('vdx_session', null));
  const [accounts, setAccounts]     = useState(() => LS.get('vdx_accounts', []));
  const [showJoin, setShowJoin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSub, setShowSub] = useState(false);
```
Replace with:
```js
export default function Veridax() {
  const [section, setSection] = useState("home");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
```

(`showSub` is removed here — Task 13 deletes the Substack import feature entirely.)

- [ ] **Step 3: Add the auth-loading effect and handlers**

Modify `src/App.jsx:2510-2518` — current:
```js
  // Persistence effects
  useEffect(() => LS.set('vdx_posts', posts), [posts]);
  useEffect(() => LS.set('vdx_votes', postVotes), [postVotes]);
  useEffect(() => LS.set('vdx_disputes', postDisputes), [postDisputes]);
  useEffect(() => LS.set('vdx_accounts', accounts), [accounts]);
  useEffect(() => { if (user) LS.set('vdx_session', user); else LS.del('vdx_session'); }, [user]);
  useEffect(() => LS.set('vdx_portfolio', portfolio), [portfolio]);
  useEffect(() => LS.set('vdx_uservotes', userVotes), [userVotes]);
```
Replace with:
```js
  // Auth: load the current session on mount, then stay in sync with
  // sign-in/sign-out events for the rest of the app's lifetime.
  useEffect(() => {
    let active = true;
    const loadUserFromSession = async (session) => {
      if (!session) { if (active) setUser(null); return; }
      try {
        const profile = await fetchProfile(session.user.id);
        if (active) setUser(toAppUser(session, profile));
      } catch {
        if (active) setUser(null);
      }
    };
    getSession().then(session => loadUserFromSession(session).finally(() => { if (active) setAuthLoading(false); }));
    const unsubscribe = onAuthStateChange(loadUserFromSession);
    return () => { active = false; unsubscribe(); };
  }, []);

  const handleJoin = async (profile) => { await signUp(profile); };
  const handleLogin = async ({ email, password }) => { await signIn({ email, password }); };
  const handleLogout = async () => { await signOut(); };

  useEffect(() => LS.set('vdx_portfolio', portfolio), [portfolio]);
```

(`vdx_posts`/`vdx_votes`/`vdx_disputes`/`vdx_uservotes`/`vdx_accounts`/`vdx_session` persistence is removed here — Task 9 replaces posts/votes with Supabase-backed data, and accounts/session are now owned by Supabase Auth. `vdx_portfolio` stays local — Phase 2/3 concern, unchanged.)

- [ ] **Step 4: Update the bottom modal render block to use the new handlers**

Modify `src/App.jsx:3649-3651` — current:
```jsx
      {showJoin && <JoinModal accounts={accounts} onClose={() => setShowJoin(false)} onJoin={v => { setAccounts(prev => [...prev, v]); setUser(v); setShowJoin(false); }} onSwitchToLogin={() => setShowLogin(true)}/>}
      {showLogin && <LoginModal accounts={accounts} onClose={() => setShowLogin(false)} onLogin={v => { setUser(v); setShowLogin(false); }} onSwitchToJoin={() => setShowJoin(true)}/>}
      {showProfile && <DashboardSidebar user={user} posts={posts} portfolio={portfolio} tokens={tokens} userVotes={userVotes} postVotes={postVotes} postDisputes={postDisputes} balance={balance} transactions={transactions} onDeposit={handleDeposit} onWithdraw={handleWithdraw} onClose={() => setShowProfile(false)} onLogout={() => { setUser(null); setShowProfile(false); }} onPublish={() => { setShowProfile(false); setShowPublish(true); }} onJoin={() => { setShowProfile(false); setShowJoin(true); }} onLogin={() => { setShowProfile(false); setShowLogin(true); }}/>}
```
Replace with:
```jsx
      {showJoin && <JoinModal onClose={() => setShowJoin(false)} onJoin={handleJoin} onSwitchToLogin={() => setShowLogin(true)}/>}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} onSwitchToJoin={() => setShowJoin(true)}/>}
      {showProfile && <DashboardSidebar user={user} posts={posts} portfolio={portfolio} tokens={tokens} userVotes={userVotes} postVotes={postVotes} postDisputes={postDisputes} balance={balance} transactions={transactions} onDeposit={handleDeposit} onWithdraw={handleWithdraw} onClose={() => setShowProfile(false)} onLogout={() => { handleLogout(); setShowProfile(false); }} onPublish={() => { setShowProfile(false); setShowPublish(true); }} onJoin={() => { setShowProfile(false); setShowJoin(true); }} onLogin={() => { setShowProfile(false); setShowLogin(true); }}/>}
```

- [ ] **Step 5: Sanity check**

Run: `npm run dev`. The app should load with `user` null (logged out) and no console errors about missing `accounts`. Full login/signup verification happens after Tasks 10–11 rewire the modals themselves.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "Wire real Supabase auth session into App.jsx"
```

---

### Task 9: Wire real posts and votes into App.jsx

**Files:**
- Modify: `src/App.jsx:2-3`, `src/App.jsx:2491-2559`

- [ ] **Step 1: Import the new data functions**

Modify `src/App.jsx:2-3` — current (after Task 8):
```js
import { nf, shannonDiversity, calcTrustScore, TOKEN_GATES, checkGates } from "./lib/scoring";
import { signUp, signIn, signOut, fetchProfile, fetchProfileCount, getSession, onAuthStateChange, toAppUser } from "./lib/auth";
```
Replace with:
```js
import { nf, shannonDiversity, calcTrustScore, TOKEN_GATES, checkGates } from "./lib/scoring";
import { signUp, signIn, signOut, fetchProfile, fetchProfileCount, getSession, onAuthStateChange, toAppUser } from "./lib/auth";
import { fetchPosts, createPost } from "./lib/posts";
import { fetchVotes, castVote, aggregateVotes } from "./lib/votes";
```

- [ ] **Step 2: Replace localStorage-based posts/votes state with Supabase-backed state**

Modify `src/App.jsx:2491-2507` — current:
```js
  const [posts, setPosts]               = useState(() => LS.get('vdx_posts', []));
  const [postVotes,    setPostVotes]    = useState(() => LS.get('vdx_votes', {}));
  const [postDisputes, setPostDisputes] = useState(() => LS.get('vdx_disputes', {}));
  const [userVotes,    setUserVotes]    = useState(() => LS.get('vdx_uservotes', {}));
  const [portfolio,    setPortfolio]    = useState(() => LS.get('vdx_portfolio', {}));
  const [validatingPost,  setValidatingPost]  = useState(null);
  const [tokenizePost,    setTokenizePost]    = useState(null);
  const [buyTokenSym,     setBuyTokenSym]     = useState(null);
  const [detailPost,      setDetailPost]      = useState(null);
  const [discoverFilter,  setDiscoverFilter]  = useState("all");
  const [discoverSearch,  setDiscoverSearch]  = useState("");
  const [discoverSort,    setDiscoverSort]    = useState("newest");
  const [showProposecat,  setShowProposecat]  = useState(false);

  const tokens = posts
    .filter(p => p.tokenData)
    .map(p => ({ sym:p.tokenData.sym, name:p.title, price:bondingPrice(p.tokenData.supply), ch:p.tokenData.change, col:p.tokenData.col, supply:p.tokenData.supply, commission:p.tokenData.commission ?? commissionRate(p.cat) }));
  const buyToken = buyTokenSym ? tokens.find(t => t.sym === buyTokenSym) : null;
```
Replace with:
```js
  const [postRows,     setPostRows]     = useState([]);
  const [rawVotes,      setRawVotes]     = useState([]);
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

- [ ] **Step 3: Load posts/votes on mount, and persist local token data**

Modify `src/App.jsx:2519-2559` — current:
```js
  const handleVote = (postId, type) => {
    if (!user || userVotes[postId]) return;
    const cluster = user.cluster || "independent";
    if (type === "up") {
      setPostVotes(prev => ({ ...prev, [postId]: { ...prev[postId], [cluster]: (prev[postId]?.[cluster]||0) + 1 } }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, up: (p.up||0) + 1 } : p));
    } else {
      setPostDisputes(prev => ({ ...prev, [postId]: { ...prev[postId], [cluster]: (prev[postId]?.[cluster]||0) + 1 } }));
    }
    setUserVotes(prev => ({ ...prev, [postId]: type }));
  };

  const handleTokenized = (postId, sym) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, tokenData: { sym, supply: 1000, col: p.color || p.col || C.amber, change: 0, commission: commissionRate(p.cat) } } : p
    ));
    setPostVotes(prev => ({ ...prev, [postId]: prev[postId] || {} }));
    setPostDisputes(prev => ({ ...prev, [postId]: prev[postId] || {} }));
    setTokenizePost(null);
  };

  const handleBought = (sym, qty, cost) => {
    setPosts(prev => prev.map(p =>
      p.tokenData?.sym === sym ? { ...p, tokenData: { ...p.tokenData, supply: p.tokenData.supply + qty } } : p
    ));
    setPortfolio(prev => ({ ...prev, [sym]: (prev[sym] || 0) + qty }));
    if (cost > 0) {
      setBalance(prev => prev - cost);
      addTx("buy", -cost, `Bought ${qty.toLocaleString()} × ⬡ ${sym}`);
    }
  };

  const handlePublish = (newPost) => {
    const cluster = user?.cluster || "independent";
    const empty = { scientific:0, civil:0, independent:0, tech:0, grassroots:0, academic:0, journalism:0, legal:0 };
    const p = { ...newPost, up: 1, cite: newPost.cite ?? 0 };
    setPosts(prev => [...prev, p]);
    setPostVotes(prev => ({ ...prev, [p.id]: { ...empty, [cluster]: 1 } }));
    setPostDisputes(prev => ({ ...prev, [p.id]: { ...empty } }));
    setUserVotes(prev => ({ ...prev, [p.id]: "up" }));
  };
```
Replace with:
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

  useEffect(() => LS.set('vdx_tokendata', localTokenData), [localTokenData]);

  const handleVote = async (postId, type) => {
    if (!user || userVotes[postId]) return;
    const cluster = user.cluster || "independent";
    const vote = await castVote({ postId, userId: user.id, cluster, type });
    setRawVotes(prev => [...prev, vote]);
  };

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

  const handlePublish = async ({ cat, title, body, summary }) => {
    if (!user) throw new Error("You must be signed in to publish.");
    const catInfo = CATS.find(c => c.name === cat);
    const created = await createPost({
      authorId: user.id,
      cat,
      title,
      body,
      summary,
      evidenceLinks: [],
      flagship: !!catInfo?.flagship,
    });
    setPostRows(prev => [...prev, created]);
    const cluster = user.cluster || "independent";
    const ownVote = await castVote({ postId: created.id, userId: user.id, cluster, type: "up" });
    setRawVotes(prev => [...prev, ownVote]);
    return created;
  };
```

- [ ] **Step 4: Replace the three `accounts.length` stat displays with the real profile count**

These are outside any modal — homepage stats, the Project Save Humanity page, and the footer stats bar. `accounts` no longer exists after Task 8, so each of these three needs to switch to `expertCount`.

Modify `src/App.jsx:2723` — current:
```js
                    {l:"EXPERTS",   v:accounts.length,        c:C.amber},
```
Replace with:
```js
                    {l:"EXPERTS",   v:expertCount,             c:C.amber},
```

Modify `src/App.jsx:2956` — current:
```js
                  {l:"CONTRIBUTORS",v:accounts.length,                            c:C.sprout},
```
Replace with:
```js
                  {l:"CONTRIBUTORS",v:expertCount,                                 c:C.sprout},
```

Modify `src/App.jsx:3626` — current:
```js
              {l:"EXPERTS",     v:accounts.length,  c:C.amber},
```
Replace with:
```js
              {l:"EXPERTS",     v:expertCount,       c:C.amber},
```

- [ ] **Step 5: Update the status bar to reflect real loading state**

Modify `src/App.jsx:2610-2616` — current:
```jsx
      {/* STATUS BAR */}
      <div style={{background:C.canopy,borderBottom:`1px solid ${C.shadow}`,padding:"5px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout,letterSpacing:3,flexShrink:0,animation:"pulse 2s infinite"}}>● LIVE</span>
        <span style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>
          {posts.length} works published · {totalValidations.toLocaleString()} validations · {tokens.length} tokens
        </span>
        <span style={{marginLeft:"auto",fontSize:9,fontFamily:"monospace",color:"#181828",flexShrink:0,animation:"blink 1s infinite"}}>█</span>
      </div>
```
Replace with:
```jsx
      {/* STATUS BAR */}
      <div style={{background:C.canopy,borderBottom:`1px solid ${C.shadow}`,padding:"5px 24px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <span style={{fontSize:7,fontFamily:"monospace",color:C.sprout,letterSpacing:3,flexShrink:0,animation:"pulse 2s infinite"}}>● LIVE</span>
        <span style={{fontSize:9,fontFamily:"monospace",color:C.dust}}>
          {dataLoading ? "Loading…" : dataError ? dataError : `${posts.length} works published · ${totalValidations.toLocaleString()} validations · ${tokens.length} tokens`}
        </span>
        <span style={{marginLeft:"auto",fontSize:9,fontFamily:"monospace",color:"#181828",flexShrink:0,animation:"blink 1s infinite"}}>█</span>
      </div>
```

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "Wire real Supabase posts and votes into App.jsx"
```

---

### Task 10: Rewrite JoinModal for real signup

**Files:**
- Modify: `src/App.jsx:665-1004`

- [ ] **Step 1: Remove the fake Proof-of-Humanity state and update the signature**

Modify `src/App.jsx:665-681` — current:
```js
function JoinModal({ onClose, onJoin, onSwitchToLogin, accounts }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pohMethod, setPohMethod] = useState(null);
  const [pohVerifying, setPohVerifying] = useState(false);
  const [pohDone, setPohDone] = useState(false);
  const [cluster, setCluster] = useState("");
  const [field, setField] = useState("");
  const [credType, setCredType] = useState("Academic Degree");
  const [credValue, setCredValue] = useState("");
  const [creds, setCreds] = useState([]);
  const [errors, setErrors] = useState({});
```
Replace with:
```js
function JoinModal({ onClose, onJoin, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cluster, setCluster] = useState("");
  const [field, setField] = useState("");
  const [credType, setCredType] = useState("Academic Degree");
  const [credValue, setCredValue] = useState("");
  const [creds, setCreds] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
```

- [ ] **Step 2: Remove the fake verification timer effect**

Modify `src/App.jsx:689-693` — current:
```js
  useEffect(() => {
    if (!pohVerifying) return;
    const t = setTimeout(() => { setPohVerifying(false); setPohDone(true); }, 2400);
    return () => clearTimeout(t);
  }, [pohVerifying]);
```
Delete this block entirely.

- [ ] **Step 3: Drop the client-side "email already exists" check** (Supabase now owns this — a real duplicate-email error surfaces from `signUp` at submit time instead)

Modify `src/App.jsx:710-721` — current:
```js
  const validateStep1 = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Letters, numbers, and underscores only.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    else if (accounts.some(a => a.email === email.trim())) e.email = "An account with this email already exists.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (password !== confirmPw) e.confirmPw = "Passwords do not match.";
    return e;
  };
```
Replace with:
```js
  const validateStep1 = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Letters, numbers, and underscores only.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (!confirmPw) e.confirmPw = "Please confirm your password.";
    else if (password !== confirmPw) e.confirmPw = "Passwords do not match.";
    return e;
  };
```

- [ ] **Step 4: Make account creation real in `handleFinish`**

Modify `src/App.jsx:742-751` — current:
```js
  const handleFinish = () => {
    const profile = {
      username: username.trim(), email: email.trim(), password,
      cluster, field: field.trim() || cluster,
      pohMethod, credentials: creds,
      joined: new Date().toLocaleDateString("en-US", { month:"short", year:"numeric" }),
    };
    onJoin(profile);
    setStep(5);
  };
```
Replace with:
```js
  const handleFinish = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await onJoin({
        username: username.trim(),
        email: email.trim(),
        password,
        cluster,
        field: field.trim() || cluster,
        credentials: creds,
      });
      setStep(5);
    } catch (err) {
      setSubmitError(err.message || "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
```

- [ ] **Step 5: Replace the fake PoH step (step 2) with an honest placeholder**

Modify `src/App.jsx:835-890` — current:
```jsx
        {/* STEP 2 — Proof of Humanity */}
        {step === 2 && (
          <>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:6}}>Prove you're human</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:18}}>
              Zero-knowledge verification proves you are a unique, real human being — <span style={{color:C.parch}}>without revealing who you are.</span> One person, one identity. No bots. No duplicate accounts.
            </p>

            {!pohDone ? (
              pohVerifying ? (
                <div style={{textAlign:"center",padding:"28px 0"}}>
                  <div style={{fontSize:38,marginBottom:12,animation:"pulse 1s infinite"}}>{pohMethod==="worldid"?"🌐":"🛡"}</div>
                  <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:6}}>VERIFYING…</div>
                  <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:16}}>Generating zero-knowledge proof</div>
                  <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${C.amber},${C.vine})`,animation:"fadein 2.4s linear forwards"}}/>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
                    {[{id:"worldid",icon:"🌐",name:"World ID",sub:"via Worldcoin",desc:"Biometric orb verification. Proves you are a unique human globally — no data stored on VERIDAX."},
                      {id:"gitcoin",icon:"🛡",name:"Gitcoin Passport",sub:"via Gitcoin",desc:"Social graph verification. Aggregates on-chain trust signals from multiple web3 sources."}].map(m => (
                      <button key={m.id} onClick={() => { setPohMethod(m.id); setPohVerifying(true); }}
                        style={{background:C.wood,border:`1px solid ${C.shadow}`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",transition:"all .2s",display:"flex",gap:14,alignItems:"center"}}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=`${C.sky}55`; e.currentTarget.style.background=`${C.sky}0a`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=C.shadow; e.currentTarget.style.background=C.wood; }}>
                        <span style={{fontSize:26,flexShrink:0}}>{m.icon}</span>
                        <div>
                          <div style={{fontSize:10,fontFamily:"monospace",color:C.sky,letterSpacing:1,marginBottom:2}}>{m.name}</div>
                          <div style={{fontSize:10,color:C.dust,lineHeight:1.65,marginBottom:3}}>{m.desc}</div>
                          <div style={{fontSize:7,fontFamily:"monospace",color:C.dust,opacity:.55}}>{m.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:9,padding:"10px 13px",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
                    <span style={{color:C.sprout}}>✦</span> Your cryptographic proof is recorded on-chain. VERIDAX never stores biometric data — only the proof of uniqueness.
                  </div>
                </>
              )
            ) : (
              <div style={{textAlign:"center",padding:"8px 0"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:C.sproutD,border:`2px solid ${C.sprout}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 14px",color:C.sprout,fontWeight:700}}>✓</div>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.sprout,letterSpacing:2,marginBottom:8}}>HUMANITY VERIFIED</div>
                <p style={{color:C.dust,fontSize:11,lineHeight:1.75,marginBottom:20}}>
                  Your zero-knowledge proof has been recorded on-chain. You are recognized as a unique real human on this network.
                </p>
                <button onClick={() => setStep(3)}
                  style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
                  CONTINUE →
                </button>
              </div>
            )}
          </>
        )}
```
Replace with:
```jsx
        {/* STEP 2 — Identity verification (deferred) */}
        {step === 2 && (
          <div style={{textAlign:"center",padding:"20px 0 8px"}}>
            <div style={{fontSize:36,marginBottom:14}}>🛡</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:19,color:C.parch,marginBottom:10}}>Identity verification — coming soon</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:22,maxWidth:340,margin:"0 auto 22px"}}>
              VERIDAX plans to support real proof-of-humanity verification (World ID, Gitcoin Passport) in a future update. It isn't live yet, so this step is a placeholder — no verification happens here.
            </p>
            <button onClick={() => setStep(3)}
              style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              CONTINUE →
            </button>
          </div>
        )}
```

- [ ] **Step 6: Update step 4's submit button to show real loading/error state**

Modify `src/App.jsx:972-978` — current:
```jsx
            <div style={{background:C.amberD,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Credentials are signed by the issuing institution. They cannot be forged. Fraudulent submissions result in a permanent ban.
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(3)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleFinish}
                style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:9,cursor:"pointer",letterSpacing:1}}>
                {creds.length || field.trim() ? "SUBMIT →" : "SKIP FOR NOW →"}
              </button>
            </div>
```
Replace with:
```jsx
            <div style={{background:C.amberD,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"9px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.amber}}>⬡</span> Credentials are signed by the issuing institution. They cannot be forged. Fraudulent submissions result in a permanent ban.
            </div>

            {submitError && (
              <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
                ✕ {submitError}
              </div>
            )}

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(3)} disabled={submitting} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleFinish} disabled={submitting}
                style={{flex:2,background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:9,cursor:submitting?"default":"pointer",letterSpacing:1,opacity:submitting?.6:1}}>
                {submitting ? "CREATING ACCOUNT…" : (creds.length || field.trim() ? "SUBMIT →" : "SKIP FOR NOW →")}
              </button>
            </div>
```

- [ ] **Step 7: Update the "done" step copy to reflect required email verification**

Modify `src/App.jsx:982-999` — current:
```jsx
        {/* STEP 5 — Done */}
        {step === 5 && (
          <div style={{textAlign:"center",padding:"10px 0 6px"}}>
            <div style={{fontSize:44,marginBottom:14}}>🌱</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Welcome, {username}.</h2>
            <p style={{color:C.dust,fontSize:12,lineHeight:1.8,marginBottom:16}}>You are now a verified node on the VERIDAX network. Your proof of humanity is recorded on-chain.</p>
            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left"}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1}}>IDENTITY SUMMARY</div>
              <div>⬡ <span style={{color:C.tan}}>@</span>{username}</div>
              <div>⬡ <span style={{color:C.tan}}>Cluster:</span> {CLUSTERS.find(c=>c.id===cluster)?.icon} {CLUSTERS.find(c=>c.id===cluster)?.label}</div>
              {field && <div>⬡ <span style={{color:C.tan}}>Field:</span> {field}</div>}
              <div>⬡ <span style={{color:C.tan}}>Proof of Humanity:</span> <span style={{color:C.sprout}}>✓ {pohMethod==="worldid"?"World ID":"Gitcoin Passport"}</span></div>
              {creds.length > 0 && <div>⬡ <span style={{color:C.tan}}>Credentials:</span> {creds.length} submitted for review</div>}
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              ENTER VERIDAX →
            </button>
          </div>
        )}
```
Replace with:
```jsx
        {/* STEP 5 — Done */}
        {step === 5 && (
          <div style={{textAlign:"center",padding:"10px 0 6px"}}>
            <div style={{fontSize:44,marginBottom:14}}>🌱</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Check your email, {username}.</h2>
            <p style={{color:C.dust,fontSize:12,lineHeight:1.8,marginBottom:16}}>We sent a confirmation link to <span style={{color:C.parch}}>{email}</span>. Click it, then log in to start using VERIDAX.</p>
            <div style={{background:C.vineD,border:`1px solid ${C.vine}20`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1,textAlign:"left"}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1}}>IDENTITY SUMMARY</div>
              <div>⬡ <span style={{color:C.tan}}>@</span>{username}</div>
              <div>⬡ <span style={{color:C.tan}}>Cluster:</span> {CLUSTERS.find(c=>c.id===cluster)?.icon} {CLUSTERS.find(c=>c.id===cluster)?.label}</div>
              {field && <div>⬡ <span style={{color:C.tan}}>Field:</span> {field}</div>}
              {creds.length > 0 && <div>⬡ <span style={{color:C.tan}}>Credentials:</span> {creds.length} submitted for review</div>}
            </div>
            <button onClick={onClose} style={{width:"100%",background:`linear-gradient(135deg,${C.amber}22,${C.vine}12)`,border:`1px solid ${C.amber}55`,color:C.amber,borderRadius:9,padding:"12px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2}}>
              GOT IT →
            </button>
          </div>
        )}
```

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "Rewrite JoinModal for real Supabase signup"
```

---

### Task 11: Rewrite LoginModal for real sign-in

**Files:**
- Modify: `src/App.jsx:1063-1095`

- [ ] **Step 1: Drop the `accounts` prop and make `handleLogin` call the real sign-in**

Modify `src/App.jsx:1063-1095` — current:
```js
function LoginModal({ onClose, onLogin, onSwitchToJoin, accounts }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inputStyle = (valid) => ({
    width:"100%", background:C.wood,
    border:`1px solid ${error ? C.bloom+"55" : valid ? C.sprout+"44" : C.shadow}`,
    borderRadius:8, padding:"10px 13px", color:C.parch, fontSize:12, fontFamily:"monospace",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  });

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    const match = accounts.find(a => a.email === email.trim() && a.password === password);
    if (!match) {
      setError(accounts.some(a => a.email === email.trim()) ? "Incorrect password." : "No account found with that email.");
      return;
    }
    onLogin(match);
  };
```
Replace with:
```js
function LoginModal({ onClose, onLogin, onSwitchToJoin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inputStyle = (valid) => ({
    width:"100%", background:C.wood,
    border:`1px solid ${error ? C.bloom+"55" : valid ? C.sprout+"44" : C.shadow}`,
    borderRadius:8, padding:"10px 13px", color:C.parch, fontSize:12, fontFamily:"monospace",
    outline:"none", boxSizing:"border-box", transition:"border-color .2s",
  });

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    try {
      await onLogin({ email: email.trim(), password });
    } catch (err) {
      setError(err.message || "Could not sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "Rewrite LoginModal for real Supabase sign-in"
```

---

### Task 12: Rewrite PublishModal and ValidationModal for real data

**Files:**
- Modify: `src/App.jsx:1598-1877` (PublishModal)
- Modify: `src/App.jsx:2028-2178` (ValidationModal)

- [ ] **Step 1: Replace PublishModal's fake signing timer with a real async publish**

Modify `src/App.jsx:1607-1640` — current:
```js
  const [signing, setSigning] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!signing) return;
    const t = setTimeout(() => {
      setSigning(false);
      const h = "0x" + Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setTxHash(h);
      setStep(4);
      if (onPublish) onPublish({
        id: `pub_${Date.now()}`,
        cat: category,
        icon: CATS.find(c => c.name === category)?.icon || "📄",
        color: CATS.find(c => c.name === category)?.color || C.amber,
        title,
        summary: body.slice(0, 200) + (body.length > 200 ? "…" : ""),
        author: user.username,
        field: user.field || user.cluster,
        verified: !!user.pohMethod,
        substack: false,
        up: 1,
        cite: 0,
      });
    }, 2800);
    return () => clearTimeout(t);
  }, [signing]);
```
Replace with:
```js
  const [signing, setSigning] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishedPost, setPublishedPost] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSign = async () => {
    setSigning(true);
    setPublishError("");
    try {
      const created = await onPublish({
        cat: category,
        title,
        body,
        summary: body.slice(0, 200) + (body.length > 200 ? "…" : ""),
      });
      setPublishedPost(created);
      setStep(4);
    } catch (err) {
      setPublishError(err.message || "Failed to publish. Please try again.");
    } finally {
      setSigning(false);
    }
  };
```

- [ ] **Step 2: Wire the "SIGN & PUBLISH" button to the new async handler and surface errors**

Modify `src/App.jsx:1829-1837` — current:
```jsx
            <div style={{background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,borderRadius:9,padding:"10px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.bloom}}>⬡</span> Once submitted, this post <span style={{color:C.parch}}>cannot be edited or deleted</span>. This is not a limitation — it is the protection. If you later believe you made an error, submit a new block addressing it. The original record remains permanent.
            </div>

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(2)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={() => setSigning(true)} style={{flex:2,background:`linear-gradient(135deg,${C.amber}28,${C.vine}18)`,border:`1px solid ${C.amber}66`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,fontWeight:700}}>SIGN & PUBLISH →</button>
            </div>
          </>
        )}
```
Replace with:
```jsx
            <div style={{background:`${C.bloom}0c`,border:`1px solid ${C.bloom}33`,borderRadius:9,padding:"10px 13px",marginBottom:16,fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:1.8}}>
              <span style={{color:C.bloom}}>⬡</span> Once submitted, this post <span style={{color:C.parch}}>cannot be edited or deleted</span>. This is not a limitation — it is the protection. If you later believe you made an error, submit a new block addressing it. The original record remains permanent.
            </div>

            {publishError && (
              <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:12,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
                ✕ {publishError}
              </div>
            )}

            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setStep(2)} style={{flex:1,background:"transparent",border:`1px solid ${C.shadow}`,color:C.dust,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:1}}>← BACK</button>
              <button onClick={handleSign} style={{flex:2,background:`linear-gradient(135deg,${C.amber}28,${C.vine}18)`,border:`1px solid ${C.amber}66`,color:C.amber,borderRadius:9,padding:"11px",fontFamily:"monospace",fontSize:10,cursor:"pointer",letterSpacing:2,fontWeight:700}}>SIGN & PUBLISH →</button>
            </div>
          </>
        )}
```

- [ ] **Step 3: Replace the fake "broadcasting to nodes" signing overlay copy**

Modify `src/App.jsx:1841-1850` — current:
```jsx
        {/* Signing overlay */}
        {step === 3 && signing && (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite"}}>⛓</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,marginBottom:6}}>SIGNING & BROADCASTING…</div>
            <div style={{fontSize:9,fontFamily:"monospace",color:C.dust,marginBottom:18}}>Cryptographically signing to your wallet · broadcasting to 19,203 nodes</div>
            <div style={{height:2,background:C.shadow,borderRadius:2,overflow:"hidden",maxWidth:300,margin:"0 auto"}}>
              <div style={{height:"100%",width:"100%",background:`linear-gradient(90deg,${C.amber},${C.vine})`,animation:"fadein 2.8s linear forwards"}}/>
            </div>
          </div>
        )}
```
Replace with:
```jsx
        {/* Signing overlay */}
        {step === 3 && signing && (
          <div style={{textAlign:"center",padding:"32px 0"}}>
            <div style={{fontSize:38,marginBottom:14,animation:"pulse 1s infinite"}}>⛓</div>
            <div style={{fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2}}>PUBLISHING…</div>
          </div>
        )}
```

- [ ] **Step 4: Replace the fake on-chain confirmation with real post data**

Modify `src/App.jsx:1852-1867` — current:
```jsx
        {/* STEP 4 — On-chain confirmation */}
        {step === 4 && (
          <div style={{textAlign:"center",padding:"6px 0"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:C.sproutD,border:`2px solid ${C.sprout}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",color:C.sprout,fontWeight:700}}>✓</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Published to the chain.</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:20}}>Your post is now permanently recorded across 19,203 nodes worldwide. It cannot be edited, deleted, or suppressed — by anyone.</p>

            <div style={{background:C.card,border:`1px solid ${C.sprout}28`,borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1,fontSize:7}}>ON-CHAIN RECORD</div>
              <div>⬡ <span style={{color:C.tan}}>Post:</span> {title.slice(0,48)}{title.length>48?"…":""}</div>
              <div>⬡ <span style={{color:C.tan}}>Author:</span> @{user.username} · {walletAddr.slice(0,10)}…</div>
              <div>⬡ <span style={{color:C.tan}}>Tx hash:</span> <span style={{color:C.amber,fontSize:8}}>{txHash.slice(0,22)}…</span></div>
              <div>⬡ <span style={{color:C.tan}}>Block:</span> #{(89403 + Math.floor(Math.random()*10)).toLocaleString()}</div>
              <div>⬡ <span style={{color:C.tan}}>Nodes confirmed:</span> <span style={{color:C.sprout}}>19,203</span></div>
              {evidenceLinks.length > 0 && <div>⬡ <span style={{color:C.tan}}>Evidence:</span> {evidenceLinks.length} link{evidenceLinks.length>1?"s":""} on-chain</div>}
            </div>
```
Replace with:
```jsx
        {/* STEP 4 — Confirmation */}
        {step === 4 && (
          <div style={{textAlign:"center",padding:"6px 0"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:C.sproutD,border:`2px solid ${C.sprout}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",color:C.sprout,fontWeight:700}}>✓</div>
            <h2 style={{fontFamily:"'Palatino Linotype',serif",fontSize:21,color:C.parch,marginBottom:8}}>Published.</h2>
            <p style={{color:C.dust,fontSize:11,lineHeight:1.8,marginBottom:20}}>Your post is now live and visible to every VERIDAX user. It cannot be edited or deleted.</p>

            <div style={{background:C.card,border:`1px solid ${C.sprout}28`,borderRadius:12,padding:"14px 16px",marginBottom:20,textAlign:"left",fontSize:9,fontFamily:"monospace",color:C.dust,lineHeight:2.1}}>
              <div style={{color:C.tan,marginBottom:4,letterSpacing:1,fontSize:7}}>RECORD</div>
              <div>⬡ <span style={{color:C.tan}}>Post:</span> {title.slice(0,48)}{title.length>48?"…":""}</div>
              <div>⬡ <span style={{color:C.tan}}>Author:</span> @{user.username}</div>
              <div>⬡ <span style={{color:C.tan}}>Published:</span> {publishedPost ? new Date(publishedPost.created_at).toLocaleString() : "—"}</div>
              {evidenceLinks.length > 0 && <div>⬡ <span style={{color:C.tan}}>Evidence:</span> {evidenceLinks.length} link{evidenceLinks.length>1?"s":""} attached</div>}
            </div>
```

- [ ] **Step 5: Update ValidationModal's `handleVote` to await the real vote, and drop the fake "on-chain" copy**

Modify `src/App.jsx:2028-2063` — current:
```js
function ValidationModal({ post, votes, disputes, user, hasVoted, onClose, onVote }) {
  const [localVotes, setLocalVotes] = useState({ ...votes });
  const [localDisp,  setLocalDisp]  = useState({ ...disputes });
  const [voted, setVoted] = useState(hasVoted || null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const score      = calcTrustScore(localVotes, localDisp);
  const totalUp    = Object.values(localVotes).reduce((s,v) => s+v, 0);
  const totalDisp  = Object.values(localDisp).reduce((s,v) => s+v, 0);
  const total      = totalUp + totalDisp;
  const rawRatio   = total === 0 ? 0 : totalUp / total;
  const diversity  = shannonDiversity(localVotes);
  const maxCluster = Math.max(...Object.values(localVotes));
  const scoreColor = score >= 0.8 ? C.sprout : score >= 0.6 ? C.amber : C.bloom;

  const handleVote = type => {
    if (voted || animating || !user) return;
    const cluster = user.cluster || "independent";
    setAnimating(true);
    setTimeout(() => {
      if (type === "up") {
        setLocalVotes(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      } else {
        setLocalDisp(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      }
      setVoted(type);
      setAnimating(false);
      onVote(type);
    }, 700);
  };
```
Replace with:
```js
function ValidationModal({ post, votes, disputes, user, hasVoted, onClose, onVote }) {
  const [localVotes, setLocalVotes] = useState({ ...votes });
  const [localDisp,  setLocalDisp]  = useState({ ...disputes });
  const [voted, setVoted] = useState(hasVoted || null);
  const [animating, setAnimating] = useState(false);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const score      = calcTrustScore(localVotes, localDisp);
  const totalUp    = Object.values(localVotes).reduce((s,v) => s+v, 0);
  const totalDisp  = Object.values(localDisp).reduce((s,v) => s+v, 0);
  const total      = totalUp + totalDisp;
  const rawRatio   = total === 0 ? 0 : totalUp / total;
  const diversity  = shannonDiversity(localVotes);
  const maxCluster = Math.max(...Object.values(localVotes));
  const scoreColor = score >= 0.8 ? C.sprout : score >= 0.6 ? C.amber : C.bloom;

  const handleVote = async type => {
    if (voted || animating || !user) return;
    const cluster = user.cluster || "independent";
    setAnimating(true);
    setVoteError("");
    try {
      await onVote(type);
      if (type === "up") {
        setLocalVotes(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      } else {
        setLocalDisp(prev => ({ ...prev, [cluster]: (prev[cluster]||0) + 1 }));
      }
      setVoted(type);
    } catch (err) {
      setVoteError(err.message || "Could not record your vote. Please try again.");
    } finally {
      setAnimating(false);
    }
  };
```

- [ ] **Step 6: Drop the fake "RECORDING ON-CHAIN…" label and surface real vote errors**

Modify `src/App.jsx:2139-2141` — current:
```jsx
        {/* Vote buttons or result */}
        {animating ? (
          <div style={{textAlign:"center",padding:"16px",fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,animation:"pulse 1s infinite"}}>RECORDING ON-CHAIN…</div>
        ) : voted ? (
```
Replace with:
```jsx
        {/* Vote buttons or result */}
        {voteError && (
          <div style={{background:`${C.bloom}12`,border:`1px solid ${C.bloom}44`,borderRadius:8,padding:"9px 13px",marginBottom:10,fontSize:10,fontFamily:"monospace",color:C.bloom}}>
            ✕ {voteError}
          </div>
        )}
        {animating ? (
          <div style={{textAlign:"center",padding:"16px",fontSize:10,fontFamily:"monospace",color:C.amber,letterSpacing:2,animation:"pulse 1s infinite"}}>RECORDING…</div>
        ) : voted ? (
```

- [ ] **Step 7: Sanity check**

Run: `npm run dev`. Sign up (Task 10), confirm your email via the link Supabase sends, log in (Task 11), publish a post, and validate/dispute a post. Confirm no console errors and the confirmation screens show real data (no tx hash, no node counts).

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "Rewrite Publish and Validation flows for real Supabase data"
```

---

### Task 13: Remove the non-functional Substack import feature

**Files:**
- Modify: `src/App.jsx:1006-1061` (delete `SubModal`)
- Modify: `src/App.jsx` (nav button, state, render call)

- [ ] **Step 1: Delete the `SubModal` component**

Delete `src/App.jsx:1006-1061` in full (the entire `function SubModal({ onClose, user }) { ... }` block).

- [ ] **Step 2: Remove the `showSub` state declaration** (already removed as part of Task 8, Step 2 — verify it's gone)

- [ ] **Step 3: Remove the "IMPORT" nav button**

Modify `src/App.jsx:2648-2653` — current:
```jsx
          <div style={{display:"flex",gap:7,marginLeft:10,flexShrink:0}}>
            <button onClick={() => setShowSub(true)}
              style={{display:"flex",alignItems:"center",gap:5,background:C.amberD,border:`1px solid ${C.amber}40`,color:C.amber,borderRadius:7,padding:"6px 10px",fontSize:8,fontFamily:"monospace",cursor:"pointer",letterSpacing:1}}>
              📰 IMPORT
            </button>
            {user ? (
```
Replace with:
```jsx
          <div style={{display:"flex",gap:7,marginLeft:10,flexShrink:0}}>
            {user ? (
```

- [ ] **Step 4: Remove the `SubModal` render call**

Modify `src/App.jsx:3652` — current:
```jsx
      {showSub && <SubModal user={user} onClose={() => setShowSub(false)}/>}
```
Delete this line entirely.

- [ ] **Step 5: Sanity check**

Run: `npm run dev`, `npm run build`. Confirm the nav no longer shows an IMPORT button and the build has no unresolved-reference errors for `SubModal`/`showSub`.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "Remove non-functional Substack import feature"
```

---

### Task 14: Deploy and run end-to-end QA

**Files:** none (configuration + manual verification)

- [ ] **Step 1: Add Supabase env vars to Vercel**

In the Vercel project settings for veridax → **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values from your local `.env`. Apply to Production (and Preview, if you want branch deploys to work too).

- [ ] **Step 2: Deploy**

Push this branch / merge to whatever branch Vercel deploys from. Confirm the deployed build succeeds and the live site loads without a "Missing Supabase env vars" error.

- [ ] **Step 3: Two-browser manual QA checklist**

Run through this on the deployed site (or `npm run dev` + an incognito window pointed at the same local server) using two separate browser profiles/incognito windows so they don't share `localStorage` or Supabase auth state:

1. In **Browser A**: sign up with a real email you can check, verify the email link, log in.
2. In **Browser A**: publish a post. Confirm the confirmation screen shows a real timestamp and no fake tx hash/node count.
3. In **Browser B** (different profile/incognito, logged out): open Discover. Confirm the post from Browser A **is visible** without logging in.
4. In **Browser B**: sign up with a different email, verify, log in.
5. In **Browser B**: validate (upvote) the post from Browser A. Confirm the trust score updates.
6. In **Browser A**: refresh the page. Confirm the post's trust score/validation count reflects Browser B's vote.
7. In **Browser B**: attempt to validate the same post a second time (e.g. by reopening the validation modal). Confirm it's blocked (already-voted state), proving the one-vote-per-user database constraint works.
8. In **Browser A**: log out, then attempt to open the dashboard. Confirm the logged-out "Join the Platform" panel appears, not an error.

If every step passes, Phase 1 (Foundation) is done: accounts, posts, and validation are real and shared.

---

## Explicitly not covered by this plan

Tokenization/market, wallet (deposit/withdraw/transactions), category proposals, and real Proof-of-Humanity integration are separate future phases per the spec — none of them are touched here beyond keeping their existing (already-local-only) behavior working unchanged.
