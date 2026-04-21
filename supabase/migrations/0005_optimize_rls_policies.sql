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
    where id = (select auth.uid())
      and role = 'Admin'
      and deleted_at is null
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
    where id = (select auth.uid())
      and role in ('Admin', 'Project Manager')
      and deleted_at is null
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
      and user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.projects
    where id = project_uuid
      and owner_id = (select auth.uid())
  )
  or public.is_manager_or_admin();
$$;

drop policy if exists "workspace_read" on public.workspace_settings;
create policy "workspace_read"
on public.workspace_settings for select
using ((select auth.role()) = 'authenticated');

drop policy if exists "projects_update_manager_or_owner" on public.projects;
create policy "projects_update_manager_or_owner"
on public.projects for update
using (public.is_manager_or_admin() or owner_id = (select auth.uid()))
with check (public.is_manager_or_admin() or owner_id = (select auth.uid()));

drop policy if exists "tasks_read_member" on public.tasks;
create policy "tasks_read_member"
on public.tasks for select
using (
  assignee_id = (select auth.uid())
  or reporter_id = (select auth.uid())
  or (project_id is not null and public.is_project_member(project_id))
  or public.is_manager_or_admin()
);

drop policy if exists "tasks_insert_authenticated" on public.tasks;
create policy "tasks_insert_authenticated"
on public.tasks for insert
with check (
  public.is_manager_or_admin()
  or assignee_id = (select auth.uid())
  or reporter_id = (select auth.uid())
  or (project_id is not null and public.is_project_member(project_id))
);

drop policy if exists "tasks_update_member" on public.tasks;
create policy "tasks_update_member"
on public.tasks for update
using (
  public.is_manager_or_admin()
  or assignee_id = (select auth.uid())
  or (project_id is not null and public.is_project_member(project_id))
)
with check (
  public.is_manager_or_admin()
  or assignee_id = (select auth.uid())
  or (project_id is not null and public.is_project_member(project_id))
);

drop policy if exists "tasks_delete_manager" on public.tasks;
create policy "tasks_delete_manager"
on public.tasks for delete
using (public.is_manager_or_admin() or reporter_id = (select auth.uid()));

drop policy if exists "task_dependencies_read" on public.task_dependencies;
create policy "task_dependencies_read"
on public.task_dependencies for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = (select auth.uid())
        or t.reporter_id = (select auth.uid())
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
);

drop policy if exists "comments_read" on public.comments;
create policy "comments_read"
on public.comments for select
using (
  exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = (select auth.uid())
        or t.reporter_id = (select auth.uid())
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
);

drop policy if exists "comments_insert_authenticated" on public.comments;
create policy "comments_insert_authenticated"
on public.comments for insert
with check (user_id = (select auth.uid()));

drop policy if exists "attachments_read" on public.attachments;
create policy "attachments_read"
on public.attachments for select
using (
  uploaded_by = (select auth.uid())
  or (project_id is not null and public.is_project_member(project_id))
  or exists (
    select 1 from public.tasks t
    where t.id = task_id
      and (
        t.assignee_id = (select auth.uid())
        or t.reporter_id = (select auth.uid())
        or (t.project_id is not null and public.is_project_member(t.project_id))
        or public.is_manager_or_admin()
      )
  )
  or public.is_manager_or_admin()
);

drop policy if exists "activity_logs_read" on public.activity_logs;
create policy "activity_logs_read"
on public.activity_logs for select
using (public.is_manager_or_admin() or user_id = (select auth.uid()));

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
using ((select auth.role()) = 'authenticated' and deleted_at is null);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using ((select auth.uid()) = id or public.is_admin())
with check ((select auth.uid()) = id or public.is_admin());

drop policy if exists "workspace_manage" on public.workspace_settings;
create policy "workspace_manage_insert"
on public.workspace_settings for insert
with check (public.is_admin());
create policy "workspace_manage_update"
on public.workspace_settings for update
using (public.is_admin())
with check (public.is_admin());
create policy "workspace_manage_delete"
on public.workspace_settings for delete
using (public.is_admin());

drop policy if exists "project_members_manage" on public.project_members;
create policy "project_members_manage_insert"
on public.project_members for insert
with check (public.is_manager_or_admin() or public.is_project_member(project_id));
create policy "project_members_manage_update"
on public.project_members for update
using (public.is_manager_or_admin() or public.is_project_member(project_id))
with check (public.is_manager_or_admin() or public.is_project_member(project_id));
create policy "project_members_manage_delete"
on public.project_members for delete
using (public.is_manager_or_admin() or public.is_project_member(project_id));

drop policy if exists "task_dependencies_manage" on public.task_dependencies;
create policy "task_dependencies_manage_insert"
on public.task_dependencies for insert
with check (public.is_manager_or_admin());
create policy "task_dependencies_manage_update"
on public.task_dependencies for update
using (public.is_manager_or_admin())
with check (public.is_manager_or_admin());
create policy "task_dependencies_manage_delete"
on public.task_dependencies for delete
using (public.is_manager_or_admin());

drop policy if exists "attachments_manage" on public.attachments;
create policy "attachments_manage_insert"
on public.attachments for insert
with check (uploaded_by = (select auth.uid()) or public.is_manager_or_admin());
create policy "attachments_manage_update"
on public.attachments for update
using (uploaded_by = (select auth.uid()) or public.is_manager_or_admin())
with check (uploaded_by = (select auth.uid()) or public.is_manager_or_admin());
create policy "attachments_manage_delete"
on public.attachments for delete
using (uploaded_by = (select auth.uid()) or public.is_manager_or_admin());

do $$
declare
  policy_record record;
  read_policy_record record;
  read_expression text;
  using_expression text;
  check_expression text;
begin
  for policy_record in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and policyname in ('tags_read', 'project_tags_read', 'task_tags_read')
  loop
    using_expression := replace(replace(policy_record.qual, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');
    check_expression := replace(replace(policy_record.with_check, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');

    execute format('alter policy %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename)
      || case when using_expression is not null then format(' using (%s)', using_expression) else '' end
      || case when check_expression is not null then format(' with check (%s)', check_expression) else '' end;
  end loop;
end $$;

do $$
declare
  policy_record record;
  using_expression text;
  check_expression text;
begin
  for policy_record in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and policyname in ('tags_manage', 'project_tags_manage', 'task_tags_manage')
  loop
    using_expression := replace(replace(policy_record.qual, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');
    check_expression := replace(replace(policy_record.with_check, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');

    select schemaname, tablename, policyname, qual
    into read_policy_record
    from pg_policies
    where schemaname = policy_record.schemaname
      and tablename = policy_record.tablename
      and policyname = replace(policy_record.policyname, '_manage', '_read')
    limit 1;

    if read_policy_record.policyname is not null and read_policy_record.qual is not null and using_expression is not null then
      read_expression := replace(replace(read_policy_record.qual, 'auth.uid()', '(select auth.uid())'), 'auth.role()', '(select auth.role())');
      execute format(
        'alter policy %I on %I.%I using ((%s) or (%s))',
        read_policy_record.policyname,
        read_policy_record.schemaname,
        read_policy_record.tablename,
        read_expression,
        using_expression
      );
    end if;

    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);

    if check_expression is not null then
      execute format(
        'create policy %I on %I.%I for insert with check (%s)',
        policy_record.policyname || '_insert',
        policy_record.schemaname,
        policy_record.tablename,
        check_expression
      );
    end if;

    if using_expression is not null then
      execute format(
        'create policy %I on %I.%I for update using (%s)%s',
        policy_record.policyname || '_update',
        policy_record.schemaname,
        policy_record.tablename,
        using_expression,
        case when check_expression is not null then format(' with check (%s)', check_expression) else '' end
      );

      execute format(
        'create policy %I on %I.%I for delete using (%s)',
        policy_record.policyname || '_delete',
        policy_record.schemaname,
        policy_record.tablename,
        using_expression
      );
    end if;
  end loop;
end $$;
