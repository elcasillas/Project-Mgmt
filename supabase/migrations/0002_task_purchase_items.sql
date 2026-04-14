alter table public.tasks
add column if not exists purchase_items jsonb not null default '[]'::jsonb;
