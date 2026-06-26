import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import {
  getActiveSectionId,
  getSectionNavLabel,
  getVisibleSectionNavItems,
  SECTION_SCROLL_MARGIN_PX,
  type SectionNavItem,
} from '../lib/sectionNav';
import {
  sectionNavRailClass,
  SectionNavRailDot,
} from './SectionNavRailDot';

function useDesktopNav() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

export function SectionNavRail() {
  const { content } = useEditMode();
  const { isDescentMode } = useDescentMode();
  const { isFullscreen, isHeroStage } = usePlayback();
  const isDesktop = useDesktopNav();

  const visibleItems = useMemo(
    () => getVisibleSectionNavItems(content),
    [content]
  );

  const [activeId, setActiveId] = useState<string | null>(
    () => visibleItems[0]?.id ?? null
  );
  const [domReady, setDomReady] = useState(false);
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

  // Wait for lazy sections to mount in the DOM
  useEffect(() => {
    if (!isDesktop || visibleItems.length === 0) return;

    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      const found = visibleItems.some((item) => item.resolve());
      if (found || attempts > 40) {
        setDomReady(true);
        syncActive();
        window.clearInterval(id);
      }
    }, 150);

    return () => window.clearInterval(id);
  }, [isDesktop, visibleItems, syncActive]);

  useEffect(() => {
    if (!isDesktop || !domReady || isDescentMode || isFullscreen || isHeroStage) return;

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
  }, [isDesktop, domReady, isDescentMode, isFullscreen, isHeroStage, syncActive]);

  useEffect(() => {
    if (!visibleItems.some((item) => item.id === activeId)) {
      setActiveId(visibleItems[0]?.id ?? null);
    }
  }, [visibleItems, activeId]);

  if (
    !isDesktop ||
    isDescentMode ||
    isFullscreen ||
    isHeroStage ||
    visibleItems.length < 2
  ) {
    return null;
  }

  return (
    <nav aria-label="Page sections" className={sectionNavRailClass}>
      {visibleItems.map((item) => {
        const isActive = activeId === item.id;
        return (
          <SectionNavRailDot
            key={item.id}
            label={getSectionNavLabel(item, content)}
            isActive={isActive}
            onClick={() => scrollToSection(item)}
          />
        );
      })}
    </nav>
  );
}
