import type { SiteContent } from '../contexts/EditModeContext';

export interface SectionNavItem {
  id: string;
  label: string;
  resolve: () => Element | null;
  isVisible: (content: SiteContent) => boolean;
}

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  {
    id: 'hero',
    label: 'Top',
    resolve: () => document.getElementById('hero-stage'),
    isVisible: (c) => c.hero.visible,
  },
  {
    id: 'about',
    label: 'About',
    resolve: () => document.querySelector('[data-section="about"]'),
    isVisible: (c) => c.about.visible,
  },
  {
    id: 'listen',
    label: 'Listen',
    resolve: () =>
      document.getElementById('listen-section-head') ??
      document.querySelector('[data-section="listen now"]') ??
      document.getElementById('music-player'),
    isVisible: (c) => c.listenNow.visible,
  },
  {
    id: 'journey',
    label: 'Discography',
    resolve: () =>
      document.getElementById('journey-section-head') ??
      document.querySelector('[data-section="journey"]'),
    isVisible: (c) => c.discography.visible,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    resolve: () => document.querySelector('[data-section="gallery"]'),
    isVisible: (c) => c.gallery.visible,
  },
  {
    id: 'tour',
    label: 'Tour',
    resolve: () => document.querySelector('[data-section="tour"]'),
    isVisible: (c) => c.tour.visible,
  },
];

/** Offset for fixed header when scrolling to a section. */
export const SECTION_SCROLL_MARGIN_PX = 112;

export function getVisibleSectionNavItems(content: SiteContent): SectionNavItem[] {
  return SECTION_NAV_ITEMS.filter((item) => item.isVisible(content));
}

interface SectionAnchor {
  item: SectionNavItem;
  top: number;
}

function getSectionAnchors(items: SectionNavItem[]): SectionAnchor[] {
  return items
    .map((item) => {
      const el = item.resolve();
      if (!el) return null;
      const top = el.getBoundingClientRect().top + window.scrollY;
      return { item, top };
    })
    .filter((entry): entry is SectionAnchor => entry != null)
    .sort((a, b) => a.top - b.top);
}

/**
 * Pick the last section whose start is above the reference line.
 * Uses a viewport-centered line so tall sections (Listen) don't steal the active dot.
 */
export function getActiveSectionId(
  items: SectionNavItem[],
  scrollMargin = SECTION_SCROLL_MARGIN_PX
): string | null {
  const anchors = getSectionAnchors(items);
  if (anchors.length === 0) return null;

  const viewportH = window.innerHeight;
  const scrollEnd =
    document.documentElement.scrollHeight - viewportH;

  // At document bottom, activate the last visible section (short tour blocks, etc.)
  if (window.scrollY >= scrollEnd - 12) {
    return anchors[anchors.length - 1].item.id;
  }

  // ~38% down the viewport — tracks what the user is reading, not just the header zone
  const referenceY =
    window.scrollY + Math.max(scrollMargin, viewportH * 0.38);

  let activeId = anchors[0].item.id;
  for (const anchor of anchors) {
    if (anchor.top <= referenceY) {
      activeId = anchor.item.id;
    } else {
      break;
    }
  }
  return activeId;
}
