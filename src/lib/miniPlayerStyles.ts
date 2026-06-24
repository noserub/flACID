import { cn } from '../components/ui/utils';
import { shadow } from './colors';

/** Shared chip width — hero and chrome use the same footprint (280–400px) */
export const miniPlayerChipWidthClass = 'w-full min-w-[17.5rem] max-w-[25rem]';

/** Hero-stage chip — sits on fullscreen viz */
export const miniPlayerChipHeroClass = cn(
  'relative border border-white/10 bg-black/75 backdrop-blur-md',
  'shadow-[0_8px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/5'
);

/** Header / fixed chrome chip */
export const miniPlayerChipChromeClass = cn(
  'h-12 border border-signal-purple/25 bg-background/90 backdrop-blur-md',
  shadow.glowPurpleSm
);

/** Shared fixed height for hero + desktop chrome chips */
export const miniPlayerChipHeightClass = 'h-12';

/** Mobile fixed strip above section nav — full width, taller touch targets */
export const miniPlayerChipChromeMobileClass = cn(
  'min-h-[3.75rem] w-full max-w-none rounded-none rounded-t-xl border-x-0 border-b-0',
  'border-t border-signal-purple/30 bg-void/95 backdrop-blur-md',
  shadow.glowPurpleSm
);

export const miniPlayerTransportTouchClass =
  'min-h-11 min-w-11 touch-manipulation shrink-0';

export const miniPlayerTransportDividerHero = 'border-r border-white/10';
export const miniPlayerTransportDividerChrome = 'border-r border-signal-purple/15';

/** Transport cluster — equal horizontal inset */
export const miniPlayerTransportPadClass = 'px-1.5 sm:px-2';

/** Track meta tap target */
export const miniPlayerMetaButtonClass =
  'flex h-full min-w-0 flex-1 items-center gap-2.5 pl-3.5 pr-2.5 text-left touch-manipulation sm:gap-3 sm:pl-4 sm:pr-3';

/** Inner row — vertically centers transport + meta in the chip */
export const miniPlayerChipRowClass = 'flex h-full w-full items-center';
