-- Allow all audio/* subtypes (mp4, mpeg, wav, …). Wildcard matches even when the client sends
-- audio/mp4; codecs=… — Supabase validates type/subtype without stripping parameters, so exact
-- entries like audio/mp4 can fail while NULL should skip validation; explicit audio/* is reliable.
UPDATE storage.buckets SET allowed_mime_types = ARRAY['audio/*']::text[] WHERE id = 'audio';
