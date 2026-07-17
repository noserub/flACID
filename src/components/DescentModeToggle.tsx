import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDescentMode } from '../contexts/DescentModeContext';
import { OPEN_DESCENT_HELP_EVENT } from '../lib/descentHelp';
import { DESCENT_MENU_PORTAL_LIFT } from '../lib/descentContentLayer';
import { brandControlClass, brandToggleActiveClass } from '../lib/brandClasses';
import { border, shadow } from '../lib/colors';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { cn } from './ui/utils';

/** Persisted so first-run education only shows once */
const DESCENT_ONBOARDING_KEY = 'flacid.descentOnboardingSeen';

/** min-h/w 11 (44px) matches Apple HIG + WCAG 2.5.5 AAA minimum touch target. */
export const descentToggleButtonClass = (isDescentMode: boolean) =>
  cn(
    'relative rounded-lg transition-all duration-300 touch-manipulation',
    'flex items-center justify-center min-h-11 px-3 sm:px-4 text-sm shrink-0',
    isDescentMode ? brandToggleActiveClass : brandControlClass
  );

type DescentToggleButtonProps = {
  isDescentMode: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
};

/**
 * Shared control used in header and fullscreen player — same look, no popover.
 */
export function DescentToggleButton({
  isDescentMode,
  onClick,
  className,
  title,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
}: DescentToggleButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={cn(descentToggleButtonClass(isDescentMode), className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={title ?? (isDescentMode ? 'Ascend: return to normal view' : 'Descend: full-page reactive visuals')}
      aria-label={
        ariaLabel ?? (isDescentMode ? 'Ascend: turn off Descend mode' : 'Descend: turn on full-page show mode')
      }
      aria-pressed={ariaPressed ?? isDescentMode}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        {isDescentMode ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 opacity-90" aria-hidden />
            <span className="whitespace-nowrap">Ascend</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 opacity-90" aria-hidden />
            <span className="whitespace-nowrap">Descend</span>
          </>
        )}
      </div>
      {isDescentMode && (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-10 rounded-lg border border-neon-green/60"
          aria-hidden
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}

function readOnboardingShouldShow(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DESCENT_ONBOARDING_KEY) !== '1';
  } catch {
    return false;
  }
}

/** Ignore “close” events that fire immediately after open (e.g. menu overlay teardown). */
const MIN_MS_BEFORE_OUTSIDE_DISMISS_COUNTS = 320;

export function DescentModeToggle() {
  const { isDescentMode, descentSupported, toggleDescentMode, setDescentMode } = useDescentMode();
  const [onboardingOpen, setOnboardingOpen] = useState(readOnboardingShouldShow);
  const openedAtRef = useRef(Date.now());

  useEffect(() => {
    if (onboardingOpen) {
      openedAtRef.current = Date.now();
    }
  }, [onboardingOpen]);

  useEffect(() => {
    const open = () => setOnboardingOpen(true);
    window.addEventListener(OPEN_DESCENT_HELP_EVENT, open);
    return () => window.removeEventListener(OPEN_DESCENT_HELP_EVENT, open);
  }, []);

  const persistOnboardingSeen = useCallback(() => {
    try {
      localStorage.setItem(DESCENT_ONBOARDING_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const markOnboardingSeen = useCallback(() => {
    persistOnboardingSeen();
    setOnboardingOpen(false);
  }, [persistOnboardingSeen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setOnboardingOpen(true);
        return;
      }
      setOnboardingOpen(false);
      // Only persist after a “real” dismiss — not bogus closes right after open
      if (Date.now() - openedAtRef.current >= MIN_MS_BEFORE_OUTSIDE_DISMISS_COUNTS) {
        persistOnboardingSeen();
      }
    },
    [persistOnboardingSeen]
  );

  const handleTryDescend = useCallback(() => {
    if (!isDescentMode) {
      setDescentMode(true);
    }
    markOnboardingSeen();
  }, [isDescentMode, setDescentMode, markOnboardingSeen]);

  const handleToggleClick = useCallback(() => {
    toggleDescentMode();
    if (onboardingOpen) {
      markOnboardingSeen();
    }
  }, [toggleDescentMode, onboardingOpen, markOnboardingSeen]);

  if (!descentSupported) {
    return null;
  }

  return (
    <Popover modal={false} open={onboardingOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div className="flex shrink-0 items-center">
          <DescentToggleButton isDescentMode={isDescentMode} onClick={handleToggleClick} />
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={10}
        collisionPadding={16}
        aria-labelledby="descent-onboarding-title"
        className={cn(
          cn(
            DESCENT_MENU_PORTAL_LIFT,
            'relative w-[min(20rem,calc(100vw-2rem))] sm:w-80 rounded-lg border',
            border.brandSoft,
            'bg-background/95 backdrop-blur-md shadow-xl p-4 text-sm text-foreground',
            shadow.glowPurpleSm
          )
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="absolute right-8 -top-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-background/95"
          aria-hidden
        />
        <div className="space-y-3 pt-0.5">
          <div>
            <p id="descent-onboarding-title" className="font-semibold text-signal-purple-bright tracking-tight">
              Turn the site into the show
            </p>
            <p className="mt-2 text-muted-foreground leading-relaxed text-[13px] sm:text-sm">
              <span className="text-neon-green/90">Descend</span> turns the page into the stage with full-screen visuals
              and motion that move with the music.{' '}
              <span className="text-muted-foreground/95">Best on desktop with the in-site player playing. Go fullscreen for the full show.</span>
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={markOnboardingSeen}
            >
              Got it
            </Button>
            <Button type="button" size="sm" onClick={handleTryDescend}>
              Try Descend
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
