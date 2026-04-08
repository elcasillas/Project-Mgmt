alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists status text not null default 'Active',
  add column if not exists last_active_at timestamptz,
  add column if not exists deleted_at timestamptz;

update public.profiles
set
  first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
  last_name = coalesce(last_name, nullif(trim(replace(full_name, split_part(full_name, ' ', 1), '')), ''));

update public.profiles
set last_name = ''
where last_name is null;

update public.profiles
set role = case
  when role = 'Manager' then 'Project Manager'
  when role = 'Member' then 'Team Member'
  else role
end;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('Admin', 'Project Manager', 'Team Member', 'Viewer'));

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles
  add constraint profiles_status_check
  check (status in ('Active', 'Inactive', 'Pending'));

create or replace function public.sync_profile_full_name()
returns trigger
language plpgsql
as $$
begin
  new.first_name = coalesce(nullif(trim(new.first_name), ''), split_part(coalesce(new.full_name, ''), ' ', 1));
  new.last_name = coalesce(new.last_name, '');
  new.full_name = trim(concat_ws(' ', coalesce(new.first_name, ''), coalesce(new.last_name, '')));
  if new.full_name = '' then
    new.full_name = split_part(coalesce(new.email, ''), '@', 1);
  end if;
  return new;
end;
$$;

drop trigger if exists sync_profiles_full_name on public.profiles;
create trigger sync_profiles_full_name
before insert or update on public.profiles
for each row execute procedure public.sync_profile_full_name();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_first_name text;
  derived_last_name text;
begin
  derived_first_name := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    split_part(coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), ' ', 1)
  );
  derived_last_name := coalesce(
    new.raw_user_meta_data ->> 'last_name',
    nullif(trim(replace(coalesce(new.raw_user_meta_data ->> 'full_name', ''), derived_first_name, '')), '')
  );

  insert into public.profiles (id, first_name, last_name, full_name, email, role, status, last_active_at)
  values (
    new.id,
    coalesce(derived_first_name, split_part(new.email, '@', 1)),
    coalesce(derived_last_name, ''),
    trim(concat_ws(' ', coalesce(derived_first_name, split_part(new.email, '@', 1)), coalesce(derived_last_name, ''))),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'Team Member'),
    coalesce(new.raw_user_meta_data ->> 'status', 'Pending'),
    timezone('utc', now())
  )
  on conflict (id) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    status = excluded.status;

  return new;
end;
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
      and role in ('Admin', 'Project Manager')
      and deleted_at is null
  );
$$;

drop policy if exists "profiles_select_self_or_workspace" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles for select
using (auth.role() = 'authenticated' and deleted_at is null);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());
