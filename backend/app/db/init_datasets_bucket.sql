-- Create a private bucket named 'datasets'
insert into storage.buckets (id, name, public)
values ('datasets', 'datasets', false)
on conflict (id) do nothing;

-- Allow authenticated users to view their own datasets (or all for now for MVP)
create policy "Authenticated users can view datasets"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'datasets' );

-- Allow authenticated users to upload datasets
create policy "Authenticated users can upload datasets"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'datasets' );

-- Allow users to update their own datasets
create policy "Authenticated users can update datasets"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'datasets' );
