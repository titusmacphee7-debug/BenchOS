create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth0_sub text not null unique,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references app_users(id) on delete cascade,
  name text not null default 'Primary Workshop',
  kind text not null default 'primary' check (kind in ('primary', 'demo')),
  is_primary boolean not null default false,
  is_sample boolean not null default false,
  sample_batch_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists workspaces_one_primary_per_user
  on workspaces(owner_user_id)
  where is_primary;

create table if not exists onboarding_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  path text check (path in ('quick', 'guided', 'power')),
  current_step text not null default 'boot',
  data jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, workspace_id)
);

create table if not exists user_goals (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  goal_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, workspace_id, goal_key)
);

create table if not exists workshop_preferences (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  workshop_type text,
  space_type text,
  experience_level text,
  ownership_level text,
  safety_preference text,
  project_interests text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id)
);

create table if not exists user_tool_platforms (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  brand text not null,
  platform text,
  favorite boolean not null default false,
  cordless_preference text,
  created_at timestamptz not null default now(),
  primary key (user_id, workspace_id, brand)
);

create table if not exists user_project_goals (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  project_key text not null,
  readiness_preview jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, workspace_id, project_key)
);

create table if not exists user_skill_profile (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  skill_level text,
  guidance_mode text,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id)
);

create table if not exists setup_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  mission_key text not null,
  title text not null,
  purpose text not null,
  cta_label text not null,
  cta_route text not null,
  readiness_impact text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, workspace_id, mission_key)
);

create table if not exists sample_data_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  label text not null,
  sample_kind text not null check (sample_kind in ('one_project', 'full_demo')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table workspaces
  add constraint workspaces_sample_batch_fk
  foreign key (sample_batch_id)
  references sample_data_batches(id)
  on delete set null
  not valid;

create table if not exists dashboard_preferences (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id)
);

create index if not exists onboarding_state_user_status_idx on onboarding_state(user_id, status);
create index if not exists setup_missions_user_workspace_idx on setup_missions(user_id, workspace_id);
create index if not exists sample_data_batches_user_idx on sample_data_batches(user_id, deleted_at);
