-- Seldom: college applications module
-- Idempotent: safe if tables/policies already exist from apply-college.sql

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  location text not null default '',
  majors text[] not null default '{}',
  application_type text not null default 'Regular Decision'
    check (application_type in ('Early Decision', 'Early Action', 'Regular Decision', 'Rolling')),
  status text not null default 'researching'
    check (status in ('researching', 'planning', 'applying', 'submitted', 'waiting', 'accepted', 'rejected', 'committed')),
  acceptance_rate numeric(5, 2),
  tuition integer,
  checklist jsonb not null default '[]'::jsonb,
  essays jsonb not null default '[]'::jsonb,
  deadlines jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists colleges_user_id_idx on public.colleges (user_id);
create index if not exists colleges_status_idx on public.colleges (status);

alter table public.colleges enable row level security;

drop policy if exists "Users can view own colleges" on public.colleges;
drop policy if exists "Users can insert own colleges" on public.colleges;
drop policy if exists "Users can update own colleges" on public.colleges;
drop policy if exists "Users can delete own colleges" on public.colleges;

create policy "Users can view own colleges"
  on public.colleges for select using (auth.uid() = user_id);
create policy "Users can insert own colleges"
  on public.colleges for insert with check (auth.uid() = user_id);
create policy "Users can update own colleges"
  on public.colleges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own colleges"
  on public.colleges for delete using (auth.uid() = user_id);

drop trigger if exists colleges_set_updated_at on public.colleges;
create trigger colleges_set_updated_at
  before update on public.colleges
  for each row execute function public.set_updated_at();

create table if not exists public.college_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  category text not null check (category in (
    'Athletics', 'Academic', 'Leadership', 'Research', 'Volunteer', 'Employment', 'Personal Project'
  )),
  organization text,
  role text,
  description text,
  start_date date,
  end_date date,
  weekly_hours numeric(4, 1),
  weeks_per_year integer check (weeks_per_year is null or (weeks_per_year >= 1 and weeks_per_year <= 52)),
  leadership text,
  achievements text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists college_activities_user_id_idx on public.college_activities (user_id);

alter table public.college_activities enable row level security;

drop policy if exists "Users can view own college activities" on public.college_activities;
drop policy if exists "Users can insert own college activities" on public.college_activities;
drop policy if exists "Users can update own college activities" on public.college_activities;
drop policy if exists "Users can delete own college activities" on public.college_activities;

create policy "Users can view own college activities"
  on public.college_activities for select using (auth.uid() = user_id);
create policy "Users can insert own college activities"
  on public.college_activities for insert with check (auth.uid() = user_id);
create policy "Users can update own college activities"
  on public.college_activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college activities"
  on public.college_activities for delete using (auth.uid() = user_id);

drop trigger if exists college_activities_set_updated_at on public.college_activities;
create trigger college_activities_set_updated_at
  before update on public.college_activities
  for each row execute function public.set_updated_at();

create table if not exists public.college_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  organization text,
  award_date date,
  level text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists college_awards_user_id_idx on public.college_awards (user_id);

alter table public.college_awards enable row level security;

drop policy if exists "Users can view own college awards" on public.college_awards;
drop policy if exists "Users can insert own college awards" on public.college_awards;
drop policy if exists "Users can update own college awards" on public.college_awards;
drop policy if exists "Users can delete own college awards" on public.college_awards;

create policy "Users can view own college awards"
  on public.college_awards for select using (auth.uid() = user_id);
create policy "Users can insert own college awards"
  on public.college_awards for insert with check (auth.uid() = user_id);
create policy "Users can update own college awards"
  on public.college_awards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college awards"
  on public.college_awards for delete using (auth.uid() = user_id);

drop trigger if exists college_awards_set_updated_at on public.college_awards;
create trigger college_awards_set_updated_at
  before update on public.college_awards
  for each row execute function public.set_updated_at();

create table if not exists public.college_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text,
  technologies text[] not null default '{}',
  my_role text,
  results text,
  challenges text,
  lessons_learned text,
  documents jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists college_projects_user_id_idx on public.college_projects (user_id);

alter table public.college_projects enable row level security;

drop policy if exists "Users can view own college projects" on public.college_projects;
drop policy if exists "Users can insert own college projects" on public.college_projects;
drop policy if exists "Users can update own college projects" on public.college_projects;
drop policy if exists "Users can delete own college projects" on public.college_projects;

create policy "Users can view own college projects"
  on public.college_projects for select using (auth.uid() = user_id);
create policy "Users can insert own college projects"
  on public.college_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own college projects"
  on public.college_projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college projects"
  on public.college_projects for delete using (auth.uid() = user_id);

drop trigger if exists college_projects_set_updated_at on public.college_projects;
create trigger college_projects_set_updated_at
  before update on public.college_projects
  for each row execute function public.set_updated_at();

create table if not exists public.college_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  test_scores jsonb not null default '{"sat":{"score":null,"status":"not_taken","date":null},"act":{"score":null,"status":"not_taken","date":null}}'::jsonb,
  financial_aid jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  scholarships jsonb not null default '[]'::jsonb,
  ai_recommendations jsonb not null default '[]'::jsonb,
  common_app jsonb not null default '{"activity_descriptions":[],"essay_ideas":[],"personal_statement_drafts":[],"supplemental_tracking":[],"reflection_notes":[]}'::jsonb,
  resume_settings jsonb not null default '{"template":"classic","selected_activity_ids":[],"selected_award_ids":[],"selected_project_ids":[],"applicationPhase":"junior","seniorModeStartedAt":null}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.college_user_data enable row level security;

drop policy if exists "Users can view own college user data" on public.college_user_data;
drop policy if exists "Users can insert own college user data" on public.college_user_data;
drop policy if exists "Users can update own college user data" on public.college_user_data;

create policy "Users can view own college user data"
  on public.college_user_data for select using (auth.uid() = user_id);
create policy "Users can insert own college user data"
  on public.college_user_data for insert with check (auth.uid() = user_id);
create policy "Users can update own college user data"
  on public.college_user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists college_user_data_set_updated_at on public.college_user_data;
create trigger college_user_data_set_updated_at
  before update on public.college_user_data
  for each row execute function public.set_updated_at();
