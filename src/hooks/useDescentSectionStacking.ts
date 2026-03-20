import { useDescentMode } from '../contexts/DescentModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { DESCENT_CONTENT_LIFT } from '../lib/descentContentLayer';

/**
 * Section stacking under Descend:
 * - Normal Descend: lift copy above effects (z-10000).
 * - Music fullscreen: use low z-index so fixed fullscreen shell (z-9980) sits above scrolling page
 *   content; Descend layers (~9990–9999) still paint on top of the player.
 */
export function useDescentSectionLiftClass(fallback = 'relative z-10') {
  const { isDescentMode } = useDescentMode();
  const { isFullscreen } = usePlayback();
  if (isFullscreen) return 'relative z-0';
  if (isDescentMode) return DESCENT_CONTENT_LIFT;
  return fallback;
}

/** For absolute UI bits (e.g. hero scroll hint) that only need a z-* class */
export function useDescentOverlayZClass(fallback = 'z-10') {
  const { isDescentMode } = useDescentMode();
  const { isFullscreen } = usePlayback();
  if (isFullscreen) return 'z-0';
  if (isDescentMode) return 'z-[10000]';
  return fallback;
}
