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

-- No explicit index on post_id alone: the unique (post_id, user_id)
-- constraint above already creates a btree index with post_id as the
-- leading column, which Postgres can use directly for post_id-only
-- lookups (e.g. the trigger's tally query below).
create index tokenize_votes_user_id_idx on public.tokenize_votes(user_id);

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
  -- Serializes concurrent votes on the same post so the count below
  -- can't miss another transaction's still-in-flight insert.
  perform pg_advisory_xact_lock(hashtext(new.post_id::text));

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
