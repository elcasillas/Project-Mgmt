alter function public.set_updated_at()
set search_path = public;

alter function public.sync_profile_full_name()
set search_path = public;

drop policy if exists "attachments_public_read" on storage.objects;
