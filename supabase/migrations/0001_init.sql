-- ============================================================================
-- Campus · Plateforme projets étudiants — schéma initial
-- À exécuter dans l'éditeur SQL de Supabase (une seule fois).
-- ============================================================================

-- Extension pour gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. profiles : extension de auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student', 'supervisor')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline date,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  supervisor_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists projects_supervisor_idx on public.projects(supervisor_id);

-- ----------------------------------------------------------------------------
-- 3. project_members
-- ----------------------------------------------------------------------------
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index if not exists project_members_user_idx on public.project_members(user_id);

-- ----------------------------------------------------------------------------
-- 4. tasks
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  assigned_to uuid references public.profiles(id) on delete set null,
  due_date date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists tasks_project_idx on public.tasks(project_id);
create index if not exists tasks_assigned_idx on public.tasks(assigned_to);

-- ----------------------------------------------------------------------------
-- 5. deliverables
-- ----------------------------------------------------------------------------
create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_name text,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists deliverables_project_idx on public.deliverables(project_id);

-- ============================================================================
-- Helper functions (SECURITY DEFINER pour éviter récursion RLS)
-- ============================================================================
create or replace function public.is_project_member(p_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project and user_id = auth.uid()
  );
$$;

create or replace function public.is_project_supervisor(p_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects
    where id = p_project and supervisor_id = auth.uid()
  );
$$;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================================
-- Trigger : créer un profile à l'inscription (full_name + role en raw_user_meta_data)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.deliverables enable row level security;

-- ---- profiles
drop policy if exists "profiles read all authenticated" on public.profiles;
create policy "profiles read all authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- projects
drop policy if exists "projects read membership" on public.projects;
create policy "projects read membership"
  on public.projects for select
  to authenticated
  using (
    supervisor_id = auth.uid()
    or public.is_project_member(id)
  );

drop policy if exists "projects insert supervisor" on public.projects;
create policy "projects insert supervisor"
  on public.projects for insert
  to authenticated
  with check (
    supervisor_id = auth.uid()
    and public.current_role() = 'supervisor'
  );

drop policy if exists "projects update own supervisor" on public.projects;
create policy "projects update own supervisor"
  on public.projects for update
  to authenticated
  using (supervisor_id = auth.uid())
  with check (supervisor_id = auth.uid());

drop policy if exists "projects delete own supervisor" on public.projects;
create policy "projects delete own supervisor"
  on public.projects for delete
  to authenticated
  using (supervisor_id = auth.uid());

-- ---- project_members
drop policy if exists "members read membership" on public.project_members;
create policy "members read membership"
  on public.project_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_project_supervisor(project_id)
  );

drop policy if exists "members insert supervisor" on public.project_members;
create policy "members insert supervisor"
  on public.project_members for insert
  to authenticated
  with check (public.is_project_supervisor(project_id));

drop policy if exists "members delete supervisor" on public.project_members;
create policy "members delete supervisor"
  on public.project_members for delete
  to authenticated
  using (public.is_project_supervisor(project_id));

-- ---- tasks
drop policy if exists "tasks read members" on public.tasks;
create policy "tasks read members"
  on public.tasks for select
  to authenticated
  using (
    public.is_project_member(project_id)
    or public.is_project_supervisor(project_id)
  );

drop policy if exists "tasks insert members" on public.tasks;
create policy "tasks insert members"
  on public.tasks for insert
  to authenticated
  with check (
    (public.is_project_member(project_id) or public.is_project_supervisor(project_id))
    and created_by = auth.uid()
  );

drop policy if exists "tasks update assignee or supervisor" on public.tasks;
create policy "tasks update assignee or supervisor"
  on public.tasks for update
  to authenticated
  using (
    public.is_project_supervisor(project_id)
    or assigned_to = auth.uid()
    or created_by = auth.uid()
  )
  with check (
    public.is_project_supervisor(project_id)
    or assigned_to = auth.uid()
    or created_by = auth.uid()
  );

drop policy if exists "tasks delete supervisor or creator" on public.tasks;
create policy "tasks delete supervisor or creator"
  on public.tasks for delete
  to authenticated
  using (
    public.is_project_supervisor(project_id)
    or created_by = auth.uid()
  );

-- ---- deliverables
drop policy if exists "deliverables read members" on public.deliverables;
create policy "deliverables read members"
  on public.deliverables for select
  to authenticated
  using (
    public.is_project_member(project_id)
    or public.is_project_supervisor(project_id)
  );

drop policy if exists "deliverables insert members" on public.deliverables;
create policy "deliverables insert members"
  on public.deliverables for insert
  to authenticated
  with check (
    (public.is_project_member(project_id) or public.is_project_supervisor(project_id))
    and uploaded_by = auth.uid()
  );

drop policy if exists "deliverables delete uploader or supervisor" on public.deliverables;
create policy "deliverables delete uploader or supervisor"
  on public.deliverables for delete
  to authenticated
  using (
    uploaded_by = auth.uid()
    or public.is_project_supervisor(project_id)
  );

-- ============================================================================
-- Realtime : publication pour les tâches
-- ============================================================================
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.deliverables;
