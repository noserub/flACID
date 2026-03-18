import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useEditMode } from '../contexts/EditModeContext';
import { EditableSection } from './EditableSection';
import { HeroEditDialog } from './HeroEditDialog';
import flacidLogo from 'figma:asset/5f0d31c1cb6fc26a3ff35f6c8e86953aaa84d0b7.png';
import heroBackground from 'figma:asset/410f7e9ef9caea1564a1bf87577512030154fe84.png';

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

// Stuttering Logo Component - Always uses stutter effect
function StutteringLogo({ isInitialLoad }: { isInitialLoad: boolean }) {
  const [sequence] = useState(generateStutterSequence());
  
  // Both initial and subsequent loads use stutter effect
  // On initial load, start from opacity 0 before stuttering
  return (
    <motion.div
      key={isInitialLoad ? 'initial-stutter' : 'stutter'}
      initial={isInitialLoad ? { opacity: 0 } : undefined}
      animate={{ 
        opacity: sequence.opacity,
      }}
      transition={{ 
        duration: sequence.duration,
        ease: 'linear',
        // Add slight delay on initial load for dramatic effect
        delay: isInitialLoad ? 0.2 : 0,
      }}
      className="flex justify-center mb-8 w-full max-w-2xl px-4"
    >
      <img 
        src={flacidLogo}
        alt="FLACID Logo"
        className="w-full h-auto"
        fetchpriority="high"
        decoding="sync"
      />
    </motion.div>
  );
}

export function HeroSection() {
  const { content, isEditMode, updateContent } = useEditMode();
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
        
        {/* Background Image */}
        <div className="absolute inset-0 bg-black">
          {/* Main Background Image */}
          <img
            src={displayBackground}
            alt="Dark psychedelic basement space"
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
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
        
        {/* Light darkened overlay for text readability - much more transparent */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-background/40 to-background/60" />
      </div>

      {/* Panning Gradient Overlays - Creates moving transparency zones */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.24) 0%, transparent 50%)',
        }}
        initial={{
          x: '-40%',
          y: '-20%',
        }}
        animate={{
          x: ['-40%', '50%', '0%', '-50%', '-40%'],
          y: ['-20%', '-30%', '-60%', '-30%', '-20%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.20) 0%, transparent 50%)',
        }}
        initial={{
          x: '35%',
          y: '60%',
        }}
        animate={{
          x: ['35%', '-50%', '0%', '50%', '35%'],
          y: ['60%', '40%', '80%', '40%', '60%'],
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
        <StutteringLogo key={stutterKey} isInitialLoad={isInitialLoad} />
        
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
              <span className="tracking-wider">Listen</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
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