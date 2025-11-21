create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users manage own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  is_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.todos enable row level security;

create policy "Users read own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

create policy "Users insert own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users update own todos"
  on public.todos
  for update
  using (auth.uid() = user_id);

create policy "Users delete own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);

