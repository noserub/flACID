/**
 * SEO Manager
 *
 * Imperative utilities for updating document meta tags.
 * Use when hooks are not available (e.g., outside React).
 */

export class SEOManager {
  static updateTitle(title: string): void {
    document.title = title;
  }

  static updateMetaDescription(description: string): void {
    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
  }

  static updateFavicon(faviconUrl: string): void {
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }
}
