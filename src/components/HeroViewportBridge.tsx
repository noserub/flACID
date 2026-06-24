import { useEffect, useRef } from 'react';
import { usePlayback } from '../contexts/PlaybackContext';

/** Exit hero view below this ratio; re-enter above enter ratio (hysteresis). */
const HERO_VIEW_EXIT_RATIO = 0.18;
const HERO_VIEW_ENTER_RATIO = 0.35;

/** Tracks whether the hero viewport is meaningfully visible for Hero Stage eligibility. */
export function HeroViewportBridge() {
  const { setHeroInView } = usePlayback();
  const inViewRef = useRef(true);

  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const attach = (el: Element) => {
      io = new IntersectionObserver(
        ([entry]) => {
          const ratio = entry?.intersectionRatio ?? 0;
          if (inViewRef.current) {
            if (ratio < HERO_VIEW_EXIT_RATIO) {
              inViewRef.current = false;
              setHeroInView(false);
            }
          } else if (ratio > HERO_VIEW_ENTER_RATIO) {
            inViewRef.current = true;
            setHeroInView(true);
          }
        },
        { threshold: [0, 0.1, 0.18, 0.35, 0.5, 0.75, 1] }
      );
      io.observe(el);
    };

    const el = document.getElementById('hero-stage');
    if (el) {
      attach(el);
      return () => io?.disconnect();
    }

    const id = window.setInterval(() => {
      const hero = document.getElementById('hero-stage');
      if (hero) {
        window.clearInterval(id);
        attach(hero);
      }
    }, 200);

    return () => {
      window.clearInterval(id);
      io?.disconnect();
    };
  }, [setHeroInView]);

  return null;
}
