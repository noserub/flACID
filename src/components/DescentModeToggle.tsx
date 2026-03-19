import { useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowUpFromLine } from 'lucide-react';
import { useDescentMode } from '../contexts/DescentModeContext';
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
            <ArrowUpFromLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">Ascend</span>
          </>
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
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

export function DescentModeToggle() {
  const { isDescentMode, toggleDescentMode, setDescentMode } = useDescentMode();
  const [onboardingOpen, setOnboardingOpen] = useState(readOnboardingShouldShow);

  const markOnboardingSeen = useCallback(() => {
    try {
      localStorage.setItem(DESCENT_ONBOARDING_KEY, '1');
    } catch {
      /* ignore */
    }
    setOnboardingOpen(false);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        markOnboardingSeen();
      }
    },
    [markOnboardingSeen]
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
    <Popover open={onboardingOpen} onOpenChange={handleOpenChange}>
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
          'relative z-[60] w-[min(20rem,calc(100vw-2rem))] sm:w-80 rounded-lg border border-cyan-500/30',
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
              <span className="text-cyan-400/90">Descend</span> layers full-page visuals that pulse with the
              music. Press <span className="text-fuchsia-400/90">play</span> first for the strongest
              reaction—you can toggle anytime.
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
