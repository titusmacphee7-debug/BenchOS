create table if not exists public.workshops (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Local Workshop',
  type text not null default 'mixed',
  cloud_sync_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  default_workshop_id uuid references public.workshops(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id)
);

create table if not exists public.workshop_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workshop_id uuid not null references public.workshops(id) on delete cascade,
  table_name text not null,
  record_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (workshop_id, table_name, record_id)
);

create index if not exists workshops_owner_user_id_idx on public.workshops(owner_user_id);
create index if not exists user_profiles_owner_user_id_idx on public.user_profiles(owner_user_id);
create index if not exists workshop_records_owner_workshop_idx on public.workshop_records(owner_user_id, workshop_id);
create index if not exists workshop_records_updated_at_idx on public.workshop_records(workshop_id, updated_at);

alter table public.workshops enable row level security;
alter table public.user_profiles enable row level security;
alter table public.workshop_records enable row level security;

drop policy if exists "Users can select own workshops" on public.workshops;
create policy "Users can select own workshops"
on public.workshops for select
to authenticated
using ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can insert own workshops" on public.workshops;
create policy "Users can insert own workshops"
on public.workshops for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can update own workshops" on public.workshops;
create policy "Users can update own workshops"
on public.workshops for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can delete own workshops" on public.workshops;
create policy "Users can delete own workshops"
on public.workshops for delete
to authenticated
using ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can select own profiles" on public.user_profiles;
create policy "Users can select own profiles"
on public.user_profiles for select
to authenticated
using ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can insert own profiles" on public.user_profiles;
create policy "Users can insert own profiles"
on public.user_profiles for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can update own profiles" on public.user_profiles;
create policy "Users can update own profiles"
on public.user_profiles for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can delete own profiles" on public.user_profiles;
create policy "Users can delete own profiles"
on public.user_profiles for delete
to authenticated
using ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can select own workshop records" on public.workshop_records;
create policy "Users can select own workshop records"
on public.workshop_records for select
to authenticated
using ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can insert own workshop records" on public.workshop_records;
create policy "Users can insert own workshop records"
on public.workshop_records for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can update own workshop records" on public.workshop_records;
create policy "Users can update own workshop records"
on public.workshop_records for update
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "Users can delete own workshop records" on public.workshop_records;
create policy "Users can delete own workshop records"
on public.workshop_records for delete
to authenticated
using ((select auth.uid()) = owner_user_id);
