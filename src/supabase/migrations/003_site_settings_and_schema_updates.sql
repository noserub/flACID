-- Site Settings and Schema Updates for Edit Mode → Supabase Sync
-- Run after 001_initial_schema.sql and 002_profiles_and_rls.sql
-- Run storage RLS policies from storage-setup.md

-- =============================================================================
-- 1. SITE_SETTINGS TABLE (hero, about, listenNow, footer, section visibility)
-- =============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero JSONB NOT NULL DEFAULT '{}',
  about JSONB NOT NULL DEFAULT '{}',
  listen_now JSONB NOT NULL DEFAULT '{}',
  footer JSONB NOT NULL DEFAULT '{}',
  discography_title TEXT DEFAULT 'Journey',
  tour_title TEXT DEFAULT 'Tour Dates',
  gallery_title TEXT DEFAULT 'Gallery',
  section_visibility JSONB NOT NULL DEFAULT '{}',
  gallery_tabs JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Authenticated can insert site settings"
  ON site_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update site settings"
  ON site_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Seed default row
INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. ALBUMS: Add track_names (list of track title strings)
-- =============================================================================
ALTER TABLE albums ADD COLUMN IF NOT EXISTS track_names JSONB DEFAULT '[]';

-- =============================================================================
-- 3. PHOTOS: Add tab_id, caption; make thumbnail_url nullable
-- =============================================================================
ALTER TABLE photos ADD COLUMN IF NOT EXISTS tab_id TEXT;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS caption TEXT;

-- Ensure existing rows have thumbnail_url before making nullable
UPDATE photos SET thumbnail_url = url WHERE thumbnail_url IS NULL OR thumbnail_url = '';
-- Make thumbnail_url nullable
ALTER TABLE photos ALTER COLUMN thumbnail_url DROP NOT NULL;

-- Add UPDATE policy for photos (was missing in 001)
CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- 4. TOUR_DATES: Ensure country has default (schema already has it)
-- =============================================================================
-- No change needed - country and status already exist with defaults
