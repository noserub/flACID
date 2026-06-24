import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { useDescentOverlayZClass } from '../hooks/useDescentSectionStacking';
import { brandHoverInteractiveClass, brandVizSurfaceClass } from '../lib/brandClasses';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { HeroEditDialog } from './HeroEditDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { MiniPlayer } from './MiniPlayer';
import { HeroListenInvite } from './HeroListenInvite';
import flacidLogo from 'figma:asset/5f0d31c1cb6fc26a3ff35f6c8e86953aaa84d0b7.png';
import heroBackground from 'figma:asset/410f7e9ef9caea1564a1bf87577512030154fe84.png';

/** Default hero dimensions for LCP optimization and CLS prevention */
const HERO_BG_WIDTH = 1920;
const HERO_BG_HEIGHT = 1080;

const STUTTER_INTERVAL_MS = 14_000;

const generateStutterSequence = () => {
  const sequences = [
    {
      opacity: [1, 0.15, 1, 0, 1, 0.4, 1, 0.1, 1, 0, 1, 0.55, 1, 0, 1],
      duration: 0.55,
    },
    {
      opacity: [1, 0, 1, 0.25, 1, 0, 1, 0.5, 1, 0, 1],
      duration: 0.45,
    },
    {
      opacity: [1, 0.1, 1, 0, 1, 0.35, 1, 0, 1, 0.2, 1, 0, 1],
      duration: 0.65,
    },
  ];

  return sequences[Math.floor(Math.random() * sequences.length)];
};

interface StutteringLogoProps {
  logoSrc: string;
  isInitialLoad: boolean;
  /** Custom hero art — stronger scrim + shadow for white-on-light suit */
  contrastBoost?: boolean;
}

function StutteringLogo({ logoSrc, isInitialLoad, contrastBoost }: StutteringLogoProps) {
  const [sequence] = useState(generateStutterSequence);

  return (
    <div className="flex justify-center w-full max-w-lg px-2">
      <div className="relative w-full">
        {contrastBoost && (
          <div
            className="pointer-events-none absolute inset-x-[-12%] inset-y-[-28%] bg-hero-logo-scrim"
            aria-hidden
          />
        )}
        <motion.div
          key={isInitialLoad ? 'initial-stutter' : 'stutter'}
          initial={isInitialLoad ? { opacity: 0, y: 16 } : undefined}
          animate={isInitialLoad ? { opacity: 1, y: 0 } : { opacity: sequence.opacity }}
          transition={
            isInitialLoad
              ? { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
              : { duration: sequence.duration, ease: 'linear' }
          }
          className="relative w-full"
        >
          <ImageWithFallback
            src={logoSrc}
            alt="flACID"
            className={cn(
              'w-full h-auto object-contain',
              'max-h-[4rem] sm:max-h-[5rem] md:max-h-24',
              contrastBoost ? 'drop-shadow-hero-logo-strong' : 'drop-shadow-hero-logo'
            )}
            fetchpriority="high"
            decoding="sync"
            width={800}
            height={200}
          />
        </motion.div>
      </div>
    </div>
  );
}

function HeroArtOverlays() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none bg-hero-fade" aria-hidden />
      <div className="absolute inset-0 pointer-events-none bg-hero-purple-glow" aria-hidden />
      <div className="absolute inset-0 hero-cosmic-grain" aria-hidden />
    </>
  );
}

export function HeroSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const {
    tracks,
    currentTrack,
    isPlaying,
    isBuffering,
    isHeroStage,
    analyser,
  } = usePlayback();
  const scrollHintZ = useDescentOverlayZClass();
  const [stutterKey, setStutterKey] = useState(0);
  const isInitialLoad = stutterKey === 0;
  const hasCustomBackground = Boolean(content.hero.backgroundImage);

  const showStage = isHeroStage && !isEditMode;
  /** Hero transport only while stage is live or audio is loading/playing — pause returns to Listen now. */
  const showTransport = showStage || isPlaying || isBuffering;
  const vizId = tracks[currentTrack]?.visualizationId ?? 0;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleStutter = () => {
      timeoutId = setTimeout(() => {
        setStutterKey((prev) => prev + 1);
        scheduleStutter();
      }, STUTTER_INTERVAL_MS);
    };

    if (!showStage) {
      scheduleStutter();
    }
    return () => clearTimeout(timeoutId);
  }, [showStage]);

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayBackground = content.hero.backgroundImage || heroBackground;
  const displayLogo = content.hero.logoImage || flacidLogo;

  const heroDockTransition = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  /** Idle — CMS art: logo + player on chest panel; default art: bottom stack */
  const heroIdleDockClass = hasCustomBackground
    ? cn(
        'bottom-auto',
        'top-[min(75%,calc(100dvh-11.5rem))]',
        'sm:top-[min(73%,calc(100dvh-11.5rem))]',
        'md:top-[min(71%,calc(100dvh-12rem))]',
        'lg:top-[min(69%,calc(100dvh-12.5rem))]'
      )
    : cn(
        'top-auto',
        'bottom-[max(1.75rem,calc(env(safe-area-inset-bottom)+1.25rem))]',
        'sm:bottom-[max(2.25rem,calc(env(safe-area-inset-bottom)+1.5rem))]',
        'md:bottom-10'
      );

  /** Stage — player settles to bottom chrome over the viz */
  const heroStageDockClass = cn(
    'top-auto',
    'bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))]',
    'sm:bottom-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))]'
  );

  return (
    <EditableSection
      sectionName="Hero"
      visible={content.hero.visible}
      onVisibilityChange={(visible) =>
        updateContent('hero', { ...content.hero, visible })
      }
      editSlot={<HeroEditDialog />}
    >
      <div
        id="hero-stage"
        className="relative min-h-[100dvh] overflow-hidden bg-void"
      >
        {/* Poster art — fades when Hero Stage is active */}
        <AnimatePresence>
          {!showStage && (
            <motion.div
              key="hero-poster"
              className={cn('absolute inset-0 bg-void', isEditMode && 'pointer-events-none')}
              initial={false}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="absolute inset-0 h-full w-full will-change-transform"
                initial={{ scale: 1.02 }}
                animate={{
                  scale: [1.02, 1.06, 1.03],
                  x: ['0%', '-1%', '-0.25%'],
                  y: ['0%', '-0.5%', '0%'],
                }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }}
              >
                <ImageWithFallback
                  src={displayBackground}
                  alt=""
                  aria-hidden
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover',
                    hasCustomBackground ? 'object-[center_32%]' : 'object-center'
                  )}
                  fetchpriority="high"
                  loading="eager"
                  decoding="async"
                  width={HERO_BG_WIDTH}
                  height={HERO_BG_HEIGHT}
                />
              </motion.div>
              <HeroArtOverlays />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Stage — full-viewport visualizer */}
        <AnimatePresence>
          {showStage && (
            <motion.div
              key="hero-viz"
              className={cn('absolute inset-0', brandVizSurfaceClass)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <PsychedelicVisualizer
                key={`hero-viz-${currentTrack}-${vizId}`}
                analyser={analyser}
                isPlaying={isPlaying}
                currentTrack={currentTrack}
                visualizationId={vizId}
              />

              <AnimatePresence>
                {isBuffering && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20 bg-black/30"
                  >
                    <Loader2 className="h-10 w-10 text-signal-purple-bright animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero dock — idle: logo + player on art; stage: animates to bottom */}
        <motion.div
          layout
          layoutRoot
          transition={heroDockTransition}
          className={cn(
            'absolute inset-x-0 z-30 px-4 sm:px-6 pointer-events-none',
            showStage ? heroStageDockClass : heroIdleDockClass,
            scrollHintZ
          )}
        >
          <div className="mx-auto flex w-full max-w-lg flex-col items-center pointer-events-auto">
            <AnimatePresence mode="popLayout">
              {!showStage && (
                <motion.div
                  key="hero-logo"
                  layout
                  className="mb-6 w-full sm:mb-7"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StutteringLogo
                    key={stutterKey}
                    logoSrc={displayLogo}
                    isInitialLoad={isInitialLoad}
                    contrastBoost={hasCustomBackground}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!isEditMode && (
              <motion.div layout className="w-full">
                {!showTransport && <HeroListenInvite />}
                {showTransport && <MiniPlayer dock="hero" />}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Scroll hint — bottom-right on idle poster; hidden lg+ where SectionNavRail owns the right edge */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-30 flex justify-end pointer-events-none lg:hidden',
            'px-4 sm:px-6',
            'pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.75rem))]',
            'sm:pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+1rem))]',
            scrollHintZ
          )}
        >
          <div
            className={cn(
              'flex flex-col items-center',
              showStage && 'invisible pointer-events-none'
            )}
            aria-hidden={showStage}
          >
            <motion.button
              type="button"
              aria-label="Scroll to about section"
              className="cursor-pointer border-0 bg-transparent p-0 pointer-events-auto"
              tabIndex={showStage ? -1 : 0}
              initial={{ opacity: 0 }}
              animate={{ opacity: showStage ? 0 : 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={scrollToAbout}
            >
              <motion.div
                animate={showStage ? undefined : { y: [0, 5, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className={cn(
                  'w-10 h-12 rounded-full flex items-center justify-center',
                  'border border-signal-purple/40 bg-card/90 backdrop-blur-sm',
                  brandHoverInteractiveClass,
                )}
              >
                <ChevronDown className="w-4 h-4 text-signal-purple-bright/60" aria-hidden />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>
    </EditableSection>
  );
}
