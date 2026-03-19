-- Tour / gallery section copy + selling_fast status + public mailing list signups
-- Run after 003_site_settings_and_schema_updates.sql

-- -----------------------------------------------------------------------------
-- 1. Site settings: editable subtitles and tour CTA line
-- -----------------------------------------------------------------------------
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tour_subtitle TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gallery_subtitle TEXT DEFAULT '';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS tour_footer_note TEXT DEFAULT 'More dates to be announced soon';

-- -----------------------------------------------------------------------------
-- 2. Tour dates: allow "selling_fast" badge in UI
-- -----------------------------------------------------------------------------
ALTER TABLE tour_dates DROP CONSTRAINT IF EXISTS tour_dates_status_check;
ALTER TABLE tour_dates ADD CONSTRAINT tour_dates_status_check
  CHECK (status IN ('upcoming', 'sold_out', 'cancelled', 'selling_fast'));

-- -----------------------------------------------------------------------------
-- 3. Newsletter subscribers (anon insert only; no public reads)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT newsletter_subscribers_email_nonempty CHECK (length(trim(email)) >= 5)
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_idx
  ON newsletter_subscribers (lower(trim(email)));

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Optional: service role / dashboard reads via Supabase; no SELECT for anon
