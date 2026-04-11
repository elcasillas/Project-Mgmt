create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'Member' check (role in ('Admin', 'Manager', 'Member')),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_name text not null default 'Northstar PM',
  default_project_status text not null default 'Planning',
  default_project_priority text not null default 'Medium',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  status text not null check (status in ('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled')),
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Critical')),
  start_date date,
  target_end_date date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  archived boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (project_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Blocked', 'In Review', 'Done')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  assignee_id uuid references public.profiles(id) on delete set null,
  reporter_id uuid references public.profiles(id) on delete set null,
  start_date date,
  due_date date,
  estimated_hours numeric(8,2),
  actual_hours numeric(8,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_task_id uuid not null references public.tasks(id) on delete cascade,
  unique (task_id, depends_on_task_id),
  check (task_id <> depends_on_task_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  check (project_id is not null or task_id is not null)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_owner_id on public.projects(owner_id);
create index if not exists idx_projects_archived_status on public.projects(archived, status);
create index if not exists idx_project_members_user_id on public.project_members(user_id);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_assignee_id on public.tasks(assignee_id);
create index if not exists idx_tasks_status_due_date on public.tasks(status, due_date);
create index if not exists idx_comments_task_id on public.comments(task_id);
create index if not exists idx_attachments_project_id on public.attachments(project_id);
create index if not exists idx_attachments_task_id on public.attachments(task_id);
create index if not exists idx_activity_logs_entity on public.activity_logs(entity_type, entity_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'Member')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'Admin'
  );
$$;

create or replace function public.is_manager_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('Admin', 'Manager')
  );
$$;

create or replace function public.is_project_member(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members
    where project_id = project_uuid
      and user_id = auth.uid()
  )
  or exists (
    select 1
    from public.projects
    where id = project_uuid
      and owner_id = auth.uid()
  )
  or public.is_manager_or_admin();
$$;

create or replace function public.log_activity(
  p_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs(user_id, entity_type, entity_id, action, metadata)
  values (p_user_id, p_entity_type, p_entity_id, p_action, p_metadata);
end;
$$;

create or replace function public.refresh_project_progress(project_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  total_count integer;
  done_count integer;
begin
  select count(*), count(*) filter (where status = 'Done')
  into total_count, done_count
  from public.tasks
  where project_id = project_uuid;

  update public.projects
  set progress = case
    when total_count = 0 then progress
    else round((done_count::numeric / total_count::numeric) * 100)
  end
  where id = project_uuid;
end;
$$;

create or replace function public.handle_task_progress_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.project_id is not null then
    perform public.refresh_project_progress(new.project_id);
  end if;

  if tg_op = 'UPDATE' and old.project_id is distinct from new.project_id and old.project_id is not null then
    perform public.refresh_project_progress(old.project_id);
  end if;

  return new;
end;
$$;

create or replace function public.handle_task_delete_progress_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.project_id is not null then
    perform public.refresh_project_progress(old.project_id);
  end if;

  return old;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_workspace_settings_updated_at on public.workspace_settings;
create trigger set_workspace_settings_updated_at before update on public.workspace_settings
for each row execute procedure public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks
for each row execute procedure public.set_updated_at();

drop trigger if exists refresh_task_progress_after_write on public.tasks;
create trigger refresh_task_progress_after_write
after insert or update on public.tasks
for each row execute procedure public.handle_task_progress_update();

drop trigger if exists refresh_task_progress_after_delete on public.tasks;
create trigger refresh_task_progress_after_delete
after delete on public.tasks
for each row execute procedure public.handle_task_delete_progress_update();

alter table public.profiles enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.activity_logs enable row level security;

create policy "profiles_select_self_or_workspace"
on public.profiles for select
using (auth.uid() = id or public.is_manager_or_admin());

create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "workspace_read"
on public.workspace_settings for select
using (auth.role() = 'authenticated');

create policy "workspace_manage"
on public.workspace_settings for all
using (public.is_admin())
with check (public.is_admin());

create policy "projects_read_member"
on public.projects for select
using (public.is_project_member(id) and archived = false or public.is_manager_or_admin());

create policy "projects_insert_manager"
on public.projects for insert
with check (public.is_manager_or_admin());

create policy "projects_update_manager_or_owner"
on public.projects for update
using (public.is_manager_or_admin() or owner_id = auth.uid())
with check (public.is_manager_or_admin() or owner_id = auth.uid());

create policy "project_members_read"
on public.project_members for select
using (public.is_project_member(project_id));

create policy "project_members_manage"
on public.project_members for all
using (public.is_manager_or_admin() or public.is_project_member(project_id))
with check (public.is_manager_or_admin() or public.is_project_member(project_id));

create policy "tasks_read_member"
on public.tasks for select
using (
  assignee_id = auth.uid()
  or reporter_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
  or public.is_manager_or_admin()
);

create policy "tasks_insert_authenticated"
on public.tasks for insert
with check (
  public.is_manager_or_admin()
  or assignee_id = auth.uid()
  or reporter_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
);

create policy "tasks_update_member"
on public.tasks for update
using (
  public.is_manager_or_admin()
  or assignee_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
)
with check (
  public.is_manager_or_admin()
  or assignee_id = auth.uid()
  or (project_id is not null and public.is_project_member(project_id))
);

create policy "tasks_delete_manager"
on public.tasks for delete
using (public.is_manager_or_admin() or reporter_id = auth.uid());

create policy "task_dependencies_read"
on public.task_dependencies for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = auth.uid()
        or t.reporter_id = auth.uid()
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
);

create policy "task_dependencies_manage"
on public.task_dependencies for all
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());

create policy "comments_read"
on public.comments for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = auth.uid()
        or t.reporter_id = auth.uid()
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
);

create policy "comments_insert_authenticated"
on public.comments for insert
with check (user_id = auth.uid());

create policy "attachments_read"
on public.attachments for select
using (
  (project_id is not null and public.is_project_member(project_id))
  or exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = auth.uid()
        or t.reporter_id = auth.uid()
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
  or public.is_manager_or_admin()
);

create policy "attachments_manage"
on public.attachments for all
using (uploaded_by = auth.uid() or public.is_manager_or_admin())
with check (uploaded_by = auth.uid() or public.is_manager_or_admin());

create policy "activity_logs_read"
on public.activity_logs for select
using (public.is_manager_or_admin() or user_id = auth.uid());

insert into public.workspace_settings (workspace_name)
select 'Northstar PM'
where not exists (select 1 from public.workspace_settings);

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "attachments_public_read"
on storage.objects for select
using (bucket_id = 'attachments');

create policy "attachments_owner_write"
on storage.objects for insert
with check (bucket_id = 'attachments' and auth.role() = 'authenticated');

create policy "attachments_owner_delete"
on storage.objects for delete
using (bucket_id = 'attachments' and auth.role() = 'authenticated');
