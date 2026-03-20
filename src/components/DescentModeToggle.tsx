import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDescentMode } from '../contexts/DescentModeContext';
import { OPEN_DESCENT_HELP_EVENT } from '../lib/descentHelp';
import { DESCENT_MENU_PORTAL_LIFT } from '../lib/descentContentLayer';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { cn } from './ui/utils';

/** Persisted so first-run education only shows once */
const DESCENT_ONBOARDING_KEY = 'flacid.descentOnboardingSeen';

export const descentToggleButtonClass = (isDescentMode: boolean) =>
  cn(
    'relative rounded-lg font-medium transition-all duration-300',
    'px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm',
    isDescentMode
      ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50 hover:bg-fuchsia-500'
      : 'bg-background/80 text-cyan-400 border border-cyan-400/30 hover:border-fuchsia-400/50 hover:text-fuchsia-400 hover:shadow-lg hover:shadow-fuchsia-500/20'
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
      title={title ?? (isDescentMode ? 'Ascend — return to normal view' : 'Descend — full-page reactive visuals')}
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
          className="absolute inset-0 bg-fuchsia-500 rounded-lg blur-xl opacity-50 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 2,
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
  const { isDescentMode, toggleDescentMode, setDescentMode } = useDescentMode();
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

  return (
    <Popover modal open={onboardingOpen} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div className="inline-flex">
          <DescentToggleButton isDescentMode={isDescentMode} onClick={handleToggleClick} />
        </div>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={10}
        collisionPadding={16}
        className={cn(
          DESCENT_MENU_PORTAL_LIFT,
          'relative w-[min(20rem,calc(100vw-2rem))] sm:w-80 rounded-lg border border-cyan-500/30',
          'bg-background/95 backdrop-blur-md shadow-xl shadow-fuchsia-950/20 p-4 text-sm text-foreground'
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div
          className="absolute right-8 -top-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-background/95"
          aria-hidden
        />
        <div className="space-y-3 pt-0.5">
          <div>
            <p className="font-semibold text-cyan-100 tracking-tight">Turn the site into the show</p>
            <p className="mt-2 text-muted-foreground leading-relaxed text-[13px] sm:text-sm">
              <span className="text-cyan-400/90">Descend</span> adds full-page layers and motion, plus a slow
              ambient swell in the background.{' '}
              <span className="text-fuchsia-400/90">When audio is playing</span>, intensity{' '}
              <span className="text-cyan-300/80">follows the track</span>—bass and loud moments push harder.{' '}
              <span className="text-muted-foreground/95">Best with the in-site player playing.</span>
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="border border-cyan-500/25 text-cyan-200/90 hover:bg-cyan-500/10 hover:text-cyan-100"
              onClick={markOnboardingSeen}
            >
              Got it
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-fuchsia-600 text-white hover:bg-fuchsia-500 shadow-md shadow-fuchsia-900/40"
              onClick={handleTryDescend}
            >
              Try Descend
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
