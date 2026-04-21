create index if not exists idx_activity_logs_user_id
on public.activity_logs(user_id);

create index if not exists idx_attachments_uploaded_by
on public.attachments(uploaded_by);

create index if not exists idx_comments_user_id
on public.comments(user_id);

create index if not exists idx_task_dependencies_depends_on_task_id
on public.task_dependencies(depends_on_task_id);

create index if not exists idx_tasks_reporter_id
on public.tasks(reporter_id);

do $$
begin
  if to_regclass('public.project_tags') is not null then
    create index if not exists idx_project_tags_tag_id
    on public.project_tags(tag_id);
  end if;

  if to_regclass('public.task_tags') is not null then
    create index if not exists idx_task_tags_tag_id
    on public.task_tags(tag_id);
  end if;
end $$;
