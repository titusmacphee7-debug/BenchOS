create table if not exists user_guide_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  guide_id text not null,
  tool_type_id text not null,
  user_tool_id text,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_step_ids text[] not null default '{}',
  skill_scores jsonb not null default '{"Safety":0,"Setup":0,"Control":0,"Accuracy":0,"Maintenance":0,"Project Use":0}'::jsonb,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  xp integer not null default 0 check (xp >= 0),
  last_practiced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_guide_progress_scope_idx
  on user_guide_progress(user_id, workspace_id, guide_id, coalesce(user_tool_id, ''));

create index if not exists user_guide_progress_user_tool_type_idx
  on user_guide_progress(user_id, workspace_id, tool_type_id);

create table if not exists user_guide_checklist_progress (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  guide_id text not null,
  tool_type_id text not null,
  checklist_key text not null,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, guide_id, checklist_key)
);

create table if not exists user_benchxp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_key text not null,
  source_type text not null check (source_type in ('guide_step', 'guide_complete', 'practice_task', 'confidence_checkin', 'mistake_log', 'maintenance_log', 'project_use')),
  guide_id text,
  tool_type_id text,
  user_tool_id text,
  xp_amount integer not null default 0 check (xp_amount >= 0),
  dimensions text[] not null default '{}',
  description text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, workspace_id, event_key)
);

create index if not exists user_benchxp_events_user_created_idx
  on user_benchxp_events(user_id, workspace_id, created_at desc);

create table if not exists user_skill_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_id uuid references user_benchxp_events(id) on delete cascade,
  guide_id text,
  tool_type_id text,
  dimension text not null,
  evidence_type text not null,
  positive boolean not null default true,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_skill_evidence_progress_idx
  on user_skill_evidence(user_id, workspace_id, progress_id, created_at desc);

create table if not exists user_practice_task_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_id uuid references user_benchxp_events(id) on delete set null,
  guide_id text not null,
  tool_type_id text not null,
  task_id text not null,
  title text not null,
  result text,
  confidence integer check (confidence >= 1 and confidence <= 5),
  dimensions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists user_confidence_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_id uuid references user_benchxp_events(id) on delete set null,
  guide_id text not null,
  tool_type_id text not null,
  confidence integer not null check (confidence >= 1 and confidence <= 5),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists user_mistake_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_id uuid references user_benchxp_events(id) on delete set null,
  guide_id text not null,
  tool_type_id text not null,
  mistake_key text not null,
  note text,
  recommendation text,
  created_at timestamptz not null default now()
);

create table if not exists user_maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  progress_id uuid references user_guide_progress(id) on delete cascade,
  event_id uuid references user_benchxp_events(id) on delete set null,
  guide_id text not null,
  tool_type_id text not null,
  maintenance_key text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists user_tool_mastery (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  tool_type_id text not null,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  skill_scores jsonb not null default '{"Safety":0,"Setup":0,"Control":0,"Accuracy":0,"Maintenance":0,"Project Use":0}'::jsonb,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, tool_type_id)
);

create table if not exists user_specific_tool_familiarity (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_tool_id text not null,
  tool_type_id text,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  skill_scores jsonb not null default '{"Safety":0,"Setup":0,"Control":0,"Accuracy":0,"Maintenance":0,"Project Use":0}'::jsonb,
  evidence_count integer not null default 0 check (evidence_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, user_tool_id)
);

create table if not exists user_category_mastery (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  category text not null,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, category)
);

create table if not exists user_technique_mastery (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  technique_key text not null,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, technique_key)
);

create table if not exists user_material_familiarity (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  material_key text not null,
  familiarity_score integer not null default 0 check (familiarity_score >= 0 and familiarity_score <= 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, material_key)
);

create table if not exists user_favorite_guides (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  guide_id text not null,
  tool_type_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, workspace_id, guide_id)
);

create table if not exists dismissed_tooltips (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  tooltip_key text not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, workspace_id, tooltip_key)
);

create table if not exists user_readiness_preferences (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  mode text not null default 'balanced' check (mode in ('relaxed', 'balanced', 'strict')),
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id)
);

create table if not exists user_mastery_roadmap_progress (
  user_id uuid not null references app_users(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  roadmap_key text not null,
  completed_step_keys text[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id, roadmap_key)
);
