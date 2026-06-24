import { cn } from '../components/ui/utils';

/** Ghost / outline controls — player, header, descent */
export const brandControlClass = cn(
  'bg-background/80 text-signal-purple-bright',
  'border border-signal-purple/35',
  'hover:border-neon-green/50 hover:text-neon-green',
  'hover:shadow-lg hover:shadow-[rgba(74,222,128,0.15)]',
  'transition-all duration-300'
);

/** Icon-only buttons inside the player chrome */
export const brandIconButtonClass = cn(
  'text-signal-purple-bright',
  'hover:text-neon-green hover:bg-signal-purple/10',
  'hover:shadow-lg hover:shadow-[rgba(74,222,128,0.12)]',
  'disabled:text-muted-foreground',
  'transition-all duration-300'
);

/** Active / connected state (e.g. AirPlay) */
export const brandActiveAccentClass = 'text-hot-pink';

/** Viz / media surface backdrop */
export const brandVizSurfaceClass =
  'bg-gradient-to-br from-[rgba(88,28,135,0.25)] via-void to-[rgba(74,222,128,0.08)]';

/** Section ambient wash */
export const brandSectionWashClass =
  'bg-gradient-to-b from-background via-[rgba(88,28,135,0.06)] to-background';

/** Spinners & loading accents */
export const brandSpinnerClass = 'text-signal-purple-bright';
