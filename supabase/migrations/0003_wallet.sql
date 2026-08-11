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
