import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import {
  getActiveSectionId,
  getVisibleSectionNavItems,
  SECTION_SCROLL_MARGIN_PX,
  type SectionNavItem,
} from '../lib/sectionNav';
import { SectionNavButton } from './SectionNavButton';
import { cn } from './ui/utils';

function useMobileNav() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return mobile;
}

const SHORT_LABELS: Record<string, string> = {
  hero: 'Top',
  about: 'About',
  listen: 'Listen',
  journey: 'Albums',
  gallery: 'Gallery',
  tour: 'Tour',
};

export function SectionNavMobile() {
  const { content } = useEditMode();
  const { isDescentMode } = useDescentMode();
  const { isFullscreen, isHeroStage } = usePlayback();
  const isMobile = useMobileNav();

  const visibleItems = useMemo(
    () => getVisibleSectionNavItems(content),
    [content]
  );

  const [activeId, setActiveId] = useState<string | null>(
    () => visibleItems[0]?.id ?? null
  );
  const scrollLockUntilRef = useRef(0);
  const scrollTargetIdRef = useRef<string | null>(null);

  const syncActive = useCallback(() => {
    if (Date.now() < scrollLockUntilRef.current && scrollTargetIdRef.current) {
      setActiveId(scrollTargetIdRef.current);
      return;
    }
    const next = getActiveSectionId(visibleItems);
    if (next) setActiveId(next);
  }, [visibleItems]);

  const scrollToSection = useCallback((item: SectionNavItem) => {
    const el = item.resolve();
    if (!el) return;
    scrollTargetIdRef.current = item.id;
    scrollLockUntilRef.current = Date.now() + 900;
    setActiveId(item.id);
    const top =
      el.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_MARGIN_PX;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isMobile || isDescentMode || isFullscreen || isHeroStage) return;

    syncActive();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncActive();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMobile, isDescentMode, isFullscreen, isHeroStage, syncActive]);

  useEffect(() => {
    if (!visibleItems.some((item) => item.id === activeId)) {
      setActiveId(visibleItems[0]?.id ?? null);
    }
  }, [visibleItems, activeId]);

  const navVisible =
    isMobile &&
    !isDescentMode &&
    !isFullscreen &&
    !isHeroStage &&
    visibleItems.length >= 2;

  useEffect(() => {
    const root = document.documentElement;
    if (navVisible) {
      root.dataset.mobileSectionNav = 'visible';
    } else {
      delete root.dataset.mobileSectionNav;
    }
    return () => {
      delete root.dataset.mobileSectionNav;
    };
  }, [navVisible]);

  if (!navVisible) {
    return null;
  }

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 lg:hidden',
        'border-t border-signal-purple/30 bg-void/95 backdrop-blur-md',
        'pb-[max(0.5rem,env(safe-area-inset-bottom))]'
      )}
    >
      <ul className="flex items-stretch justify-around gap-0.5 px-1 pt-1.5">
        {visibleItems.map((item) => {
          const isActive = activeId === item.id;
          const label = SHORT_LABELS[item.id] ?? item.label;
          return (
            <li key={item.id} className="flex-1 min-w-0">
              <SectionNavButton
                aria-label={`Go to ${item.label}`}
                aria-current={isActive ? 'true' : undefined}
                isActive={isActive}
                onClick={() => scrollToSection(item)}
              >
                {label}
              </SectionNavButton>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
