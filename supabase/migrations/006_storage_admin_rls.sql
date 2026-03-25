-- Storage: restrict uploads to site admins only (run AFTER buckets `audio`, `covers`, `photos` exist)
-- Run in Supabase SQL Editor. Replaces broad "authenticated" storage policies from storage-setup.md.

-- Drop legacy authenticated-write policies (names from docs)
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete covers" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;

-- Public read policies unchanged — re-create only if you dropped them (idempotent no-op if missing)
-- SELECT policies typically named "Public ... viewable" — do not drop here.

-- Site admins only (requires migration 005 `is_site_admin()`)
CREATE POLICY "Site admins can upload audio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio' AND public.is_site_admin());

CREATE POLICY "Site admins can update audio"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'audio' AND public.is_site_admin())
  WITH CHECK (bucket_id = 'audio' AND public.is_site_admin());

CREATE POLICY "Site admins can delete audio"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'audio' AND public.is_site_admin());

CREATE POLICY "Site admins can upload covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND public.is_site_admin());

CREATE POLICY "Site admins can update covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND public.is_site_admin())
  WITH CHECK (bucket_id = 'covers' AND public.is_site_admin());

CREATE POLICY "Site admins can delete covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND public.is_site_admin());

CREATE POLICY "Site admins can upload photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND public.is_site_admin());

CREATE POLICY "Site admins can delete photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'photos' AND public.is_site_admin());
