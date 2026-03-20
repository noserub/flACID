import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentOverlayZClass } from '../hooks/useDescentSectionStacking';
import { cn } from './ui/utils';
import { EditableSection } from './EditableSection';
import { HeroEditDialog } from './HeroEditDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import flacidLogo from 'figma:asset/5f0d31c1cb6fc26a3ff35f6c8e86953aaa84d0b7.png';
import heroBackground from 'figma:asset/410f7e9ef9caea1564a1bf87577512030154fe84.png';

/** Default hero dimensions for LCP optimization and CLS prevention */
const HERO_BG_WIDTH = 1920;
const HERO_BG_HEIGHT = 1080;

// Generate random stutter sequence - Multiple rapid flickers per second
const generateStutterSequence = () => {
  const sequences = [
    // Rapid multi-glitch (1.0s) - 20 rapid flickers
    {
      opacity: [1, 0, 1, 0, 1, 0.3, 1, 0, 1, 0.5, 1, 0, 1, 0.2, 1, 0, 1, 0.4, 1, 0, 1, 0, 1, 0.6, 1, 0, 1, 0.1, 1, 0, 1],
      duration: 0.8,
    },
    // Ultra strobe (0.6s) - 12 flickers
    {
      opacity: [1, 0, 1, 0, 1, 0, 1, 0.3, 1, 0, 1, 0, 1, 0.5, 1, 0, 1, 0, 1],
      duration: 0.6,
    },
    // Hyper flicker (1.2s) - 24 flickers
    {
      opacity: [1, 0, 1, 0.2, 1, 0, 1, 0, 1, 0.4, 1, 0, 1, 0, 1, 0.3, 1, 0, 1, 0, 1, 0.6, 1, 0, 1, 0, 1, 0.1, 1, 0, 1, 0, 1, 0.5, 1, 0, 1],
      duration: 1.2,
    },
    // Fast burst (0.5s) - 10 flickers
    {
      opacity: [1, 0, 1, 0, 1, 0.4, 1, 0, 1, 0, 1, 0.2, 1, 0, 1],
      duration: 0.5,
    },
    // Machine glitch (0.9s) - 18 flickers
    {
      opacity: [1, 0, 1, 0, 1, 0, 1, 0.3, 1, 0, 1, 0, 1, 0, 1, 0.5, 1, 0, 1, 0.1, 1, 0, 1, 0, 1, 0.4, 1, 0, 1],
      duration: 0.9,
    },
  ];
  
  return sequences[Math.floor(Math.random() * sequences.length)];
};

// Stuttering Logo Component - Uses content.hero.logoImage when set, fallback to bundled asset
interface StutteringLogoProps {
  logoSrc: string;
  isInitialLoad: boolean;
}

function StutteringLogo({ logoSrc, isInitialLoad }: StutteringLogoProps) {
  const [sequence] = useState(generateStutterSequence());

  return (
    <motion.div
      key={isInitialLoad ? 'initial-stutter' : 'stutter'}
      initial={isInitialLoad ? { opacity: 0 } : undefined}
      animate={{ opacity: sequence.opacity }}
      transition={{
        duration: sequence.duration,
        ease: 'linear',
        delay: isInitialLoad ? 0.2 : 0,
      }}
      className="flex justify-center mb-8 w-full max-w-2xl px-4"
    >
      <ImageWithFallback
        src={logoSrc}
        alt="FLACID Logo"
        className="w-full h-auto max-h-32 object-contain"
        fetchpriority="high"
        decoding="sync"
        width={800}
        height={200}
      />
    </motion.div>
  );
}

export function HeroSection() {
  const { content, isEditMode, updateContent } = useEditMode();
  const scrollHintZ = useDescentOverlayZClass();
  const [stutterKey, setStutterKey] = useState(0);
  const isInitialLoad = stutterKey === 0;
  
  useEffect(() => {
    // Trigger new glitch sequence every 10 seconds
    const triggerStutter = () => {
      setTimeout(() => {
        setStutterKey(prev => prev + 1);
        triggerStutter();
      }, 10000);
    };
    
    triggerStutter();
  }, []);
  
  const scrollToMusicPlayer = () => {
    const musicSection = document.getElementById('music-player');
    if (musicSection) {
      musicSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {isEditMode && <HeroEditDialog />}
        
        {/* Background Image - LCP optimized with dimensions to prevent CLS */}
        <div className="absolute inset-0 bg-black">
          <ImageWithFallback
            src={displayBackground}
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
            loading="eager"
            decoding="async"
            width={HERO_BG_WIDTH}
            height={HERO_BG_HEIGHT}
          />
        
        {/* Panning Gradient Overlay - Creates transparency variation */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 1000px 700px at 50% 50%, transparent 0%, rgba(10, 10, 15, 0.5) 80%)',
          }}
          animate={{
            backgroundPosition: [
              '0% 0%',
              '100% 0%',
              '100% 100%',
              '0% 100%',
              '0% 0%',
            ],
            backgroundSize: ['200% 200%', '250% 250%', '200% 200%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Light darkened overlay for text readability - smooth gradient, no hard line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.25) 25%, rgba(10,10,15,0.4) 50%, rgba(10,10,15,0.5) 75%, rgba(10,10,15,0.6) 100%)',
          }}
        />
      </div>

      {/* Panning glow overlays - gradient position animated so the glow moves, element stays fixed (no moving rectangles) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.2) 0%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 20%', '80% 100%', '20% 80%', '0% 0%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.16) 0%, transparent 70%)',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['100% 100%', '0% 80%', '20% 0%', '80% 20%', '100% 100%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <StutteringLogo
          key={stutterKey}
          logoSrc={displayLogo}
          isInitialLoad={isInitialLoad}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="space-y-3"
        >
          <p className="text-xl md:text-2xl text-cyan-300/90 tracking-wide">
            {content.hero.subtitle}
          </p>
          {content.hero.tagline && (
            <p className="text-base md:text-lg text-fuchsia-300/70 tracking-wide">
              {content.hero.tagline}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12"
        >
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-fuchsia-500 blur-2xl opacity-50 animate-pulse" />
            <button 
              onClick={scrollToMusicPlayer}
              className="relative px-8 py-4 bg-fuchsia-500 hover:bg-fuchsia-600 rounded-lg transition-all duration-300 shadow-lg shadow-fuchsia-900/50"
            >
              <span className="tracking-wider">Experience</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer',
          scrollHintZ
        )}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => {
          const aboutSection = document.querySelector('[data-section="about"]');
          if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <div className="w-12 h-16 border-2 border-cyan-400/50 rounded-full flex items-center justify-center hover:border-fuchsia-400/70 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300">
          <ChevronDown className="w-6 h-6 text-cyan-400/70" />
        </div>
      </motion.div>
      </div>
    </EditableSection>
  );
}