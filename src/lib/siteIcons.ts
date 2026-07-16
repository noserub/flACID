/** Bump when favicon / PWA icon assets change — busts browser and path caches. */
export const SITE_ICON_VERSION = '20260716f';

/** Versioned directory so Chrome/PWA cannot reuse stale icons by path. */
export const SITE_ICON_DIR = `/icons/${SITE_ICON_VERSION}`;

export const SITE_ICONS = {
  favicon16: `${SITE_ICON_DIR}/favicon-16x16.png`,
  favicon32: `${SITE_ICON_DIR}/favicon-32x32.png`,
  appleTouch: `${SITE_ICON_DIR}/apple-touch-icon.png`,
  android192: `${SITE_ICON_DIR}/android-chrome-192x192.png`,
  android512: `${SITE_ICON_DIR}/android-chrome-512x512.png`,
  manifest: `/manifest.webmanifest?v=${SITE_ICON_VERSION}`,
} as const;

export function siteIconUrl(path: string): string {
  if (path.startsWith('/icons/')) return path;
  const file = path.replace(/^\//, '');
  return `${SITE_ICON_DIR}/${file}`;
}
