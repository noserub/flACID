import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Play } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentOverlayZClass } from '../hooks/useDescentSectionStacking';
import { HERO_COPY } from '../constants/brand';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { HeroEditDialog } from './HeroEditDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
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
}

function StutteringLogo({ logoSrc, isInitialLoad }: StutteringLogoProps) {
  const [sequence] = useState(generateStutterSequence);

  return (
    <motion.div
      key={isInitialLoad ? 'initial-stutter' : 'stutter'}
      initial={isInitialLoad ? { opacity: 0, y: 16 } : undefined}
      animate={isInitialLoad ? { opacity: 1, y: 0 } : { opacity: sequence.opacity }}
      transition={
        isInitialLoad
          ? { duration: 1.1, ease: [0.22, 1, 0.36, 1] }
          : { duration: sequence.duration, ease: 'linear' }
      }
      className="flex justify-center w-full max-w-md sm:max-w-lg px-2"
    >
      <ImageWithFallback
        src={logoSrc}
        alt="flACID"
        className={cn(
          'w-full h-auto object-contain',
          'max-h-[3.75rem] sm:max-h-20 md:max-h-24',
          'drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]',
          'drop-shadow-[0_0_48px_rgba(147,51,234,0.25)]'
        )}
        fetchpriority="high"
        decoding="sync"
        width={800}
        height={200}
      />
    </motion.div>
  );
}

function HeroArtOverlays() {
  return (
    <>
      {/* Keep upper art clear — vignette heavy at bottom for logo dock */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(5,5,8,0.12) 0%,
              transparent 28%,
              transparent 48%,
              rgba(5,5,8,0.55) 72%,
              rgba(5,5,8,0.92) 88%,
              rgba(5,5,8,0.98) 100%
            )`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% 88%, rgba(88,28,135,0.22) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div className="absolute inset-0 hero-cosmic-grain" aria-hidden />
    </>
  );
}

export function HeroSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const scrollHintZ = useDescentOverlayZClass();
  const [stutterKey, setStutterKey] = useState(0);
  const isInitialLoad = stutterKey === 0;
  const hasCustomBackground = Boolean(content.hero.backgroundImage);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleStutter = () => {
      timeoutId = setTimeout(() => {
        setStutterKey((prev) => prev + 1);
        scheduleStutter();
      }, STUTTER_INTERVAL_MS);
    };

    scheduleStutter();
    return () => clearTimeout(timeoutId);
  }, []);

  const scrollToMusicPlayer = () => {
    const musicSection = document.getElementById('music-player');
    if (musicSection) {
      musicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToAbout = () => {
    const aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayBackground = content.hero.backgroundImage || heroBackground;
  const displayLogo = content.hero.logoImage || flacidLogo;

  return (
    <EditableSection
      sectionName="Hero"
      visible={content.hero.visible}
      onVisibilityChange={(visible) =>
        updateContent('hero', { ...content.hero, visible })
      }
    >
      <div className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden bg-void">
        {isEditMode && <HeroEditDialog />}

        <div className="absolute inset-0 bg-void">
          <motion.div
            className="absolute inset-0 will-change-transform"
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
                'w-full h-full object-cover',
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
        </div>

        {/* Bottom dock — Listen first, logo signs the poster */}
        <div
          className={cn(
            'relative z-10 w-full font-hero',
            'pb-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.25rem))]',
            'md:pb-[max(6rem,calc(env(safe-area-inset-bottom)+4.75rem))]'
          )}
        >
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex w-full flex-col items-center gap-7 sm:gap-9 md:gap-10"
            >
              <div className="relative group">
                <div
                  className="absolute -inset-2 rounded-2xl opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(105deg, var(--signal-purple) 0%, var(--hot-pink-bright) 50%, var(--neon-green-dim) 100%)',
                  }}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={scrollToMusicPlayer}
                  className={cn(
                    'relative inline-flex items-center justify-center gap-2.5',
                    'min-h-12 px-10 py-3.5 rounded-xl',
                    'bg-primary text-primary-foreground',
                    'text-sm sm:text-base font-semibold tracking-[0.2em] uppercase',
                    'shadow-lg shadow-[rgba(147,51,234,0.5)]',
                    'ring-1 ring-white/10',
                    'transition-all duration-300',
                    'hover:bg-[var(--signal-purple-bright)] hover:scale-[1.02]',
                    'hover:shadow-[rgba(192,132,252,0.55)]',
                    'active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-purple-bright focus-visible:ring-offset-2 focus-visible:ring-offset-void'
                  )}
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden />
                  {HERO_COPY.ctaLabel}
                </button>
              </div>

              <StutteringLogo
                key={stutterKey}
                logoSrc={displayLogo}
                isInitialLoad={isInitialLoad}
              />
            </motion.div>
          </div>
        </div>

        <motion.button
          type="button"
          aria-label="Scroll to about section"
          className={cn(
            'absolute left-1/2 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0',
            'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
            scrollHintZ
          )}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          onClick={scrollToAbout}
        >
          <div
            className={cn(
              'w-11 h-14 rounded-full flex items-center justify-center',
              'border border-signal-purple/40',
              'hover:border-neon-green/50 hover:shadow-[0_0_24px_rgba(74,222,128,0.2)]',
              'transition-all duration-300'
            )}
          >
            <ChevronDown className="w-5 h-5 text-signal-purple-bright/70" aria-hidden />
          </div>
        </motion.button>
      </div>
    </EditableSection>
  );
}
