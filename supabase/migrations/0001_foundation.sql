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
  author_id uuid not null references public.profiles(id) on delete restrict,
  cat text not null,
  title text not null,
  body text not null,
  summary text not null,
  evidence_links jsonb not null default '[]'::jsonb,
  flagship boolean not null default false,
  created_at timestamptz not null default now(),
  constraint flagship_only_for_psh check (not flagship or cat = 'Project Save Humanity')
);

alter table public.posts enable row level security;

create index posts_author_id_idx on public.posts(author_id);

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
  user_id uuid not null references public.profiles(id) on delete restrict,
  cluster text not null,
  type text not null check (type in ('up', 'dispute')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.votes enable row level security;

create index votes_user_id_idx on public.votes(user_id);

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
