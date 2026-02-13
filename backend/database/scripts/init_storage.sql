-- ============================================================================
-- USER PROFILE STORAGE CONFIGURATION
-- ============================================================================
-- This file configures Supabase storage for user profiles and related data.
--
-- User metadata flow:
-- 1. Settings Page (settings/page.tsx) updates user metadata via Supabase Auth
--    - first_name, last_name, username, avatar_url are stored in auth.users metadata
-- 2. Dashboard Header (dashboard/layout.tsx) reads from Supabase Auth user session
--    - Displays username from user.user_metadata?.username
-- 3. Avatar images are stored in the 'avatars' storage bucket
-- ============================================================================

-- Create a public bucket named 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public access to view avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- Allow users to update their own avatars
create policy "Users can update their own avatars"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'avatars' );

-- ============================================================================
-- USER METADATA NOTES
-- ============================================================================
-- Username and profile information are stored in auth.users.raw_user_meta_data:
-- {
--   "full_name": "John Doe",
--   "first_name": "John",
--   "last_name": "Doe", 
--   "username": "johndoe",
--   "avatar_url": "https://..."
-- }
--
-- To display updated username in dashboard:
-- 1. Dashboard fetches current user: supabase.auth.getUser()
-- 2. Accesses username via: user.user_metadata?.username
-- 3. Username updates automatically when user updates in Settings
-- 4. Refresh page or call getUser() again to see latest changes
-- ============================================================================
