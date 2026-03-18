/**
 * SEO Hook
 *
 * Updates document meta tags for improved search engine visibility.
 * Use on route changes or page-level components.
 */

import { useEffect } from 'react';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

function ensureMetaTag(nameOrProperty: string, isProperty: boolean): HTMLMetaElement {
  const selector = isProperty
    ? `meta[property="${nameOrProperty}"]`
    : `meta[name="${nameOrProperty}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) {
      el.setAttribute('property', nameOrProperty);
    } else {
      el.setAttribute('name', nameOrProperty);
    }
    document.head.appendChild(el);
  }
  return el;
}

export function useSEO(seoData: SEOData): void {
  useEffect(() => {
    document.title = seoData.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seoData.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = seoData.description;
      document.head.appendChild(meta);
    }

    if (seoData.keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', seoData.keywords);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = seoData.keywords;
        document.head.appendChild(meta);
      }
    }

    // Open Graph
    const ogTitle = ensureMetaTag('og:title', true);
    ogTitle.setAttribute('content', seoData.title);
    const ogDesc = ensureMetaTag('og:description', true);
    ogDesc.setAttribute('content', seoData.description);
    if (seoData.image) {
      const ogImage = ensureMetaTag('og:image', true);
      ogImage.setAttribute('content', seoData.image);
    }
    if (seoData.url) {
      const ogUrl = ensureMetaTag('og:url', true);
      ogUrl.setAttribute('content', seoData.url);
    }
    if (seoData.type) {
      const ogType = ensureMetaTag('og:type', true);
      ogType.setAttribute('content', seoData.type);
    }

    // Twitter Card
    const twitterTitle = ensureMetaTag('twitter:title', false);
    twitterTitle.setAttribute('content', seoData.title);
    const twitterDesc = ensureMetaTag('twitter:description', false);
    twitterDesc.setAttribute('content', seoData.description);
    if (seoData.image) {
      const twitterImage = ensureMetaTag('twitter:image', false);
      twitterImage.setAttribute('content', seoData.image);
    }
  }, [seoData]);
}
