/** Bump when favicon / PWA icon assets change — busts browser and manifest caches. */
export const SITE_ICON_VERSION = '20260716e';

export function siteIconUrl(path: string): string {
  return `${path}?v=${SITE_ICON_VERSION}`;
}
