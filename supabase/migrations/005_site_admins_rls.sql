-- Site admins: explicit allowlist for CMS + storage writes (run after 004)
-- Add admin user IDs only via Supabase SQL Editor (service role) or Dashboard.

-- =============================================================================
-- 1. SITE_ADMINS TABLE (references auth.users; no client writes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.site_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_admins ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see only their own row (for client isAdmin check)
CREATE POLICY "site_admins_select_own"
  ON public.site_admins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE for authenticated — manage rows in SQL Editor as postgres/service_role

COMMENT ON TABLE public.site_admins IS 'CMS/storage admins. INSERT user_id via SQL Editor only.';

-- =============================================================================
-- 2. HELPER: true if current user is a site admin (used by RLS policies)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_site_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_admins s WHERE s.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_site_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_site_admin() TO authenticated;

-- =============================================================================
-- 3. DROP broad "authenticated can write" policies
-- =============================================================================
DROP POLICY IF EXISTS "Authenticated users can insert tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can update tracks" ON public.tracks;
DROP POLICY IF EXISTS "Authenticated users can delete tracks" ON public.tracks;

DROP POLICY IF EXISTS "Authenticated users can insert albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can update albums" ON public.albums;
DROP POLICY IF EXISTS "Authenticated users can delete albums" ON public.albums;

DROP POLICY IF EXISTS "Authenticated users can insert tour dates" ON public.tour_dates;
DROP POLICY IF EXISTS "Authenticated users can update tour dates" ON public.tour_dates;
DROP POLICY IF EXISTS "Authenticated users can delete tour dates" ON public.tour_dates;

DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;

DROP POLICY IF EXISTS "Authenticated can insert site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated can update site settings" ON public.site_settings;

-- =============================================================================
-- 4. SITE ADMIN–ONLY WRITE POLICIES
-- =============================================================================
CREATE POLICY "Site admins can insert tracks"
  ON public.tracks FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can update tracks"
  ON public.tracks FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can delete tracks"
  ON public.tracks FOR DELETE TO authenticated
  USING (public.is_site_admin());

CREATE POLICY "Site admins can insert albums"
  ON public.albums FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can update albums"
  ON public.albums FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can delete albums"
  ON public.albums FOR DELETE TO authenticated
  USING (public.is_site_admin());

CREATE POLICY "Site admins can insert tour dates"
  ON public.tour_dates FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can update tour dates"
  ON public.tour_dates FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can delete tour dates"
  ON public.tour_dates FOR DELETE TO authenticated
  USING (public.is_site_admin());

CREATE POLICY "Site admins can insert photos"
  ON public.photos FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can update photos"
  ON public.photos FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can delete photos"
  ON public.photos FOR DELETE TO authenticated
  USING (public.is_site_admin());

CREATE POLICY "Site admins can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_site_admin());

CREATE POLICY "Site admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

-- After running: add at least one admin, e.g. (replace with your auth user id):
-- INSERT INTO public.site_admins (user_id) VALUES ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
--   ON CONFLICT DO NOTHING;
