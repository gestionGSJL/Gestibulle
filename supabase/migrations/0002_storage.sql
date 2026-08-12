-- Private bucket for finance task payment-proof photos.
-- Objects are stored at `${family_id}/${task_id}-${timestamp}.jpg`.

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

create policy "family members can read their receipts"
  on storage.objects for select
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = current_family_id()::text);

create policy "family members can upload their receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = current_family_id()::text);

create policy "family members can delete their receipts"
  on storage.objects for delete
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = current_family_id()::text);
