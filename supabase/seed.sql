insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@northstarpm.com', crypt('Password123!', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Avery Stone","first_name":"Avery","last_name":"Stone","role":"Admin","status":"Active"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@northstarpm.com', crypt('Password123!', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Lee","first_name":"Jordan","last_name":"Lee","role":"Project Manager","status":"Active"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@northstarpm.com', crypt('Password123!', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Taylor Brooks","first_name":"Taylor","last_name":"Brooks","role":"Team Member","status":"Active"}', timezone('utc', now()), timezone('utc', now()), '', '', '', ''),
  ('44444444-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'viewer@northstarpm.com', crypt('Password123!', gen_salt('bf')), timezone('utc', now()), '{"provider":"email","providers":["email"]}', '{"full_name":"Morgan Hale","first_name":"Morgan","last_name":"Hale","role":"Viewer","status":"Pending"}', timezone('utc', now()), timezone('utc', now()), '', '', '', '')
on conflict (id) do nothing;

insert into public.profiles (id, first_name, last_name, full_name, email, role, status, avatar_url, last_active_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Avery', 'Stone', 'Avery Stone', 'admin@northstarpm.com', 'Admin', 'Active', null, timezone('utc', now()) - interval '1 hour'),
  ('22222222-2222-2222-2222-222222222222', 'Jordan', 'Lee', 'Jordan Lee', 'manager@northstarpm.com', 'Project Manager', 'Active', null, timezone('utc', now()) - interval '3 hours'),
  ('33333333-3333-3333-3333-333333333333', 'Taylor', 'Brooks', 'Taylor Brooks', 'member@northstarpm.com', 'Team Member', 'Active', null, timezone('utc', now()) - interval '1 day'),
  ('44444444-1111-1111-1111-111111111111', 'Morgan', 'Hale', 'Morgan Hale', 'viewer@northstarpm.com', 'Viewer', 'Pending', null, null)
on conflict (id) do update
set first_name = excluded.first_name,
    last_name = excluded.last_name,
set full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    status = excluded.status,
    last_active_at = excluded.last_active_at;

insert into public.projects (id, name, description, owner_id, status, priority, start_date, target_end_date, progress, notes)
values
  ('44444444-4444-4444-4444-444444444441', 'Q2 Client Portal', 'Launch the new client-facing delivery and approvals portal for enterprise accounts.', '22222222-2222-2222-2222-222222222222', 'Active', 'Critical', current_date - interval '18 days', current_date + interval '21 days', 68, 'Weekly steering committee every Tuesday.'),
  ('44444444-4444-4444-4444-444444444442', 'Revenue Ops Automation', 'Automate handoffs between sales, onboarding, and finance with workflow guardrails.', '11111111-1111-1111-1111-111111111111', 'Planning', 'High', current_date - interval '7 days', current_date + interval '42 days', 24, 'Vendor shortlist complete.'),
  ('44444444-4444-4444-4444-444444444443', 'Infrastructure Hardening', 'Reduce deployment risk and improve alerting, rollback, and access management.', '11111111-1111-1111-1111-111111111111', 'Active', 'High', current_date - interval '30 days', current_date + interval '10 days', 37, 'Pending firewall exception approval.')
on conflict (id) do nothing;

insert into public.project_members (project_id, user_id)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444443', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333333')
on conflict do nothing;

insert into public.tasks (id, project_id, title, description, status, priority, assignee_id, reporter_id, start_date, due_date, estimated_hours, actual_hours)
values
  ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'Finalize SSO rollout plan', 'Coordinate launch checklist with security and customer success.', 'In Progress', 'Urgent', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', current_date - interval '6 days', current_date + interval '3 days', 16, 9),
  ('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444441', 'Polish executive dashboard metrics', 'Refine data cards and validate refresh timing with finance.', 'In Review', 'High', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', current_date - interval '8 days', current_date + interval '1 day', 12, 11),
  ('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444442', 'Map automation dependencies', 'Confirm source systems, owners, and exceptions.', 'Not Started', 'Medium', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', current_date + interval '1 day', current_date + interval '8 days', 10, null),
  ('55555555-5555-5555-5555-555555555554', '44444444-4444-4444-4444-444444444443', 'Close stale admin access', 'Remove unused elevated permissions across production systems.', 'Blocked', 'Urgent', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', current_date - interval '14 days', current_date - interval '2 days', 8, 6),
  ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444443', 'Draft rollback checklist', 'Prepare release checklist for incident response and rollback.', 'Done', 'High', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', current_date - interval '12 days', current_date - interval '5 days', 6, 5)
on conflict (id) do nothing;

insert into public.task_dependencies (task_id, depends_on_task_id)
values
  ('55555555-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555551'),
  ('55555555-5555-5555-5555-555555555553', '55555555-5555-5555-5555-555555555552')
on conflict do nothing;

insert into public.comments (task_id, user_id, body)
values
  ('55555555-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', 'Security approved the SSO policy update. Final rollout note is still pending.'),
  ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', 'Scheduling launch rehearsal for Thursday afternoon.'),
  ('55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333333', 'Blocked on vendor response for the firewall change.')
on conflict do nothing;

select public.log_activity('22222222-2222-2222-2222-222222222222', 'project', '44444444-4444-4444-4444-444444444441', 'project_created', '{"projectName":"Q2 Client Portal"}');
select public.log_activity('11111111-1111-1111-1111-111111111111', 'task', '55555555-5555-5555-5555-555555555551', 'task_created', '{"title":"Finalize SSO rollout plan"}');
select public.log_activity('22222222-2222-2222-2222-222222222222', 'task', '55555555-5555-5555-5555-555555555552', 'task_status_changed', '{"from":"In Progress","to":"In Review"}');
select public.log_activity('11111111-1111-1111-1111-111111111111', 'project', '44444444-4444-4444-4444-444444444443', 'project_updated', '{"field":"target_end_date"}');
