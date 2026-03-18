/**
 * Supabase Storage URL Helpers
 *
 * Free tier: no server-side image transforms. Optimize by:
 * - Preferring thumbnail_url for grids/lists (smaller files)
 * - Using full url only when needed (lightbox, hero)
 * - Relying on browser lazy-load and proper img sizing
 */

/** Check if URL is from our Supabase Storage (same project) */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.hostname.endsWith('.supabase.co') && u.pathname.includes('/storage/');
  } catch {
    return false;
  }
}

/**
 * Get display URL for Supabase Storage images.
 * Prefer thumbnail when available to reduce egress.
 */
export function getOptimizedStorageUrl(
  fullUrl: string,
  thumbnailUrl: string | null,
  context: 'thumbnail' | 'full' = 'thumbnail'
): string {
  if (!fullUrl) return '';
  if (context === 'thumbnail' && thumbnailUrl) return thumbnailUrl;
  return fullUrl;
}
