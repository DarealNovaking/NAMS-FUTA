drop policy if exists "admins manage site settings" on public.site_settings;
-- Keep the existing public SELECT policy for the approved public settings keys.
-- No client-facing admin role receives INSERT, UPDATE, or DELETE access to site_settings.
