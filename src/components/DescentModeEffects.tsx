import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDescentMode } from '../contexts/DescentModeContext';
import { useDescentIntensity } from '../contexts/DescentIntensityContext';
import heroBackground from 'figma:asset/410f7e9ef9caea1564a1bf87577512030154fe84.png';

// Scroll Boundary Glow Effect
export function ScrollBoundaryGlow() {
  const { isDescentMode } = useDescentMode();
  const [topGlow, setTopGlow] = useState(0);
  const [bottomGlow, setBottomGlow] = useState(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const scrollAttemptRef = useRef(0);

  useEffect(() => {
    if (!isDescentMode) {
      setTopGlow(0);
      setBottomGlow(0);
      return;
    }

    let decayInterval: number;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Calculate scroll velocity (pixels per millisecond)
      const deltaY = currentScrollY - lastScrollY.current;
      const deltaTime = currentTime - lastScrollTime.current;
      const velocity = Math.abs(deltaY / Math.max(deltaTime, 1));

      // Normalize velocity to 0-1 range (cap at fast scroll speed)
      const normalizedVelocity = Math.min(velocity / 2, 1); // 2px/ms = max intensity

      // Check if at top or bottom
      const atTop = currentScrollY <= 0;
      const atBottom = currentScrollY + windowHeight >= scrollHeight - 5; // 5px threshold

      // Update glow based on scroll position and velocity
      if (atTop && deltaY <= 0) {
        // At top and trying to scroll up (or already stuck at top)
        setTopGlow(prev => Math.min(1, prev + normalizedVelocity * 0.3 + 0.15));
        setBottomGlow(0);
      } else if (atBottom && deltaY >= 0) {
        // At bottom and trying to scroll down (or already stuck at bottom)
        setBottomGlow(prev => Math.min(1, prev + normalizedVelocity * 0.3 + 0.15));
        setTopGlow(0);
      } else {
        // Not at boundary or scrolling away from boundary
        // Let decay handle the fade
      }

      lastScrollY.current = currentScrollY;
      lastScrollTime.current = currentTime;
    };

    // Listen for wheel events to detect scroll attempts even when stuck at boundary
    const handleWheel = (e: WheelEvent) => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      const atTop = currentScrollY <= 0;
      const atBottom = currentScrollY + windowHeight >= scrollHeight - 5;

      // Detect scroll attempt direction
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;

      // Calculate intensity based on wheel delta
      const wheelIntensity = Math.min(Math.abs(e.deltaY) / 100, 1);

      if (atTop && scrollingUp) {
        // Trying to scroll up while at top
        setTopGlow(prev => Math.min(1, prev + wheelIntensity * 0.4));
        setBottomGlow(0);
      } else if (atBottom && scrollingDown) {
        // Trying to scroll down while at bottom
        setBottomGlow(prev => Math.min(1, prev + wheelIntensity * 0.4));
        setTopGlow(0);
      }
    };

    // Decay effect for smooth fade-out
    const startDecay = () => {
      decayInterval = window.setInterval(() => {
        setTopGlow(prev => Math.max(0, prev - 0.08));
        setBottomGlow(prev => Math.max(0, prev - 0.08));
      }, 16); // ~60fps
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    startDecay();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      if (decayInterval) {
        clearInterval(decayInterval);
      }
    };
  }, [isDescentMode]);

  if (!isDescentMode) return null;

  return (
    <>
      {/* Top boundary glow */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-40 pointer-events-none z-[9998]"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 255, 255, 0.6), transparent)',
          opacity: topGlow,
          filter: 'blur(25px)',
        }}
      />

      {/* Bottom boundary glow */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-[9998]"
        style={{
          background: 'linear-gradient(to top, rgba(0, 200, 200, 0.6), transparent)',
          opacity: bottomGlow,
          filter: 'blur(25px)',
        }}
      />
    </>
  );
}

// Glitch effect component for text
export function GlitchOverlay() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();

  if (!isDescentMode) return null;

  const aberrationAmount = 2 + (intensity.totalIntensity * 4); // 2-6px based on intensity

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] mix-blend-screen" 
         style={{ opacity: 0.3 + (intensity.totalIntensity * 0.2) }}>
      {/* Chromatic aberration effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.15) 0%, transparent 50%)',
          filter: 'blur(3px)',
        }}
        animate={{
          x: [-aberrationAmount, aberrationAmount, -aberrationAmount],
          y: [aberrationAmount, -aberrationAmount, aberrationAmount],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.15) 0%, transparent 50%)',
          filter: 'blur(3px)',
        }}
        animate={{
          x: [aberrationAmount, -aberrationAmount, aberrationAmount],
          y: [-aberrationAmount, aberrationAmount, -aberrationAmount],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </div>
  );
}

// Scanline/VHS effect
export function ScanlineEffect() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();

  if (!isDescentMode) return null;

  // Scanline intensity increases with mid frequencies
  const scanlineOpacity = 0.2 + (intensity.eqBands.mid * 0.3);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ opacity: scanlineOpacity }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        }}
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// Organic tendril/creature animations
export function OrganicTendrils() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();
  const [tendrils, setTendrils] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (!isDescentMode) {
      setTendrils([]);
      return;
    }

    // Generate random tendrils - count varies with bass
    const baseCount = 12;
    const bassBoost = Math.floor(intensity.eqBands.bass * 8); // Up to 8 extra tendrils from bass
    const tendrilCount = baseCount + bassBoost;
    
    const newTendrils = Array.from({ length: tendrilCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setTendrils(newTendrils);
  }, [isDescentMode, intensity.eqBands.bass]);

  if (!isDescentMode) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9997] overflow-hidden">
      {tendrils.map((tendril) => {
        // Tendrils react to low-mid frequencies
        const tendrilIntensity = 0.5 + (intensity.eqBands.lowMid * 0.5);
        const duration = 8 / tendrilIntensity; // Faster when intense
        
        return (
          <motion.div
            key={tendril.id}
            className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-fuchsia-500/20 to-transparent"
            style={{
              left: `${tendril.x}%`,
              top: `${tendril.y}%`,
              filter: 'blur(2px)',
              opacity: 0.4 + (intensity.totalIntensity * 0.4),
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: [0, 1, 0.8, 1.2, 0],
              opacity: [0, 0.6 * tendrilIntensity, 0.4 * tendrilIntensity, 0.7 * tendrilIntensity, 0],
              rotate: [0, 15 * tendrilIntensity, -10 * tendrilIntensity, 20 * tendrilIntensity, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: tendril.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Particle system
export function DescentParticles() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    baseAlpha: number;
    // Organism properties
    targetX: number;
    targetY: number;
    behaviorType: 'wanderer' | 'seeker' | 'avoider' | 'orbiter';
    decisionTimer: number;
    energy: number;
    maxSpeed: number;
    personalityPhase: number;
  }>>([]);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDescentMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDescentMode]);

  useEffect(() => {
    if (!isDescentMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles as living organisms
    if (particlesRef.current.length === 0) {
      const particleCount = 120;
      const behaviors: Array<'wanderer' | 'seeker' | 'avoider' | 'orbiter'> = ['wanderer', 'seeker', 'avoider', 'orbiter'];
      
      for (let i = 0; i < particleCount; i++) {
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
          baseAlpha: Math.random() * 0.6 + 0.3,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
          behaviorType: behavior,
          decisionTimer: Math.random() * 120,
          energy: Math.random(),
          maxSpeed: Math.random() * 2 + 1,
          personalityPhase: Math.random() * Math.PI * 2,
        });
      }
    }

    let animationId: number;
    let frameCount = 0;

    const animate = () => {
      // Gentle trail effect for organic motion trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frameCount++;

      particlesRef.current.forEach((particle, index) => {
        // Decision-making: periodically choose new targets/behaviors
        particle.decisionTimer--;
        if (particle.decisionTimer <= 0) {
          particle.decisionTimer = Math.random() * 180 + 60; // 1-4 seconds at 60fps
          
          // Some particles change behavior occasionally
          if (Math.random() > 0.85) {
            const behaviors: Array<'wanderer' | 'seeker' | 'avoider' | 'orbiter'> = ['wanderer', 'seeker', 'avoider', 'orbiter'];
            particle.behaviorType = behaviors[Math.floor(Math.random() * behaviors.length)];
          }

          // Choose new target
          particle.targetX = Math.random() * canvas.width;
          particle.targetY = Math.random() * canvas.height;
        }

        // Behavior-based movement
        let forceX = 0;
        let forceY = 0;

        switch (particle.behaviorType) {
          case 'wanderer':
            // Drift with organic sine wave patterns
            const wanderAngle = frameCount * 0.01 + particle.personalityPhase;
            forceX = Math.cos(wanderAngle) * 0.3;
            forceY = Math.sin(wanderAngle * 1.3) * 0.3;
            break;

          case 'seeker':
            // Attracted to mouse
            const seekDx = mousePos.current.x - particle.x;
            const seekDy = mousePos.current.y - particle.y;
            const seekDist = Math.sqrt(seekDx * seekDx + seekDy * seekDy);
            if (seekDist > 10) {
              forceX = (seekDx / seekDist) * 0.5;
              forceY = (seekDy / seekDist) * 0.5;
            }
            break;

          case 'avoider':
            // Repelled by mouse
            const avoidDx = particle.x - mousePos.current.x;
            const avoidDy = particle.y - mousePos.current.y;
            const avoidDist = Math.sqrt(avoidDx * avoidDx + avoidDy * avoidDy);
            if (avoidDist < 200 && avoidDist > 0) {
              const avoidForce = (200 - avoidDist) / 200;
              forceX = (avoidDx / avoidDist) * avoidForce * 0.8;
              forceY = (avoidDy / avoidDist) * avoidForce * 0.8;
            }
            break;

          case 'orbiter':
            // Orbit around mouse
            const orbitDx = mousePos.current.x - particle.x;
            const orbitDy = mousePos.current.y - particle.y;
            const orbitDist = Math.sqrt(orbitDx * orbitDx + orbitDy * orbitDy);
            const desiredOrbitDist = 150;
            
            if (orbitDist > 0) {
              // Tangential force (perpendicular to radial direction)
              forceX = -orbitDy / orbitDist * 0.5;
              forceY = orbitDx / orbitDist * 0.5;
              
              // Radial force to maintain orbit distance
              const radialForce = (desiredOrbitDist - orbitDist) / desiredOrbitDist * 0.2;
              forceX += (orbitDx / orbitDist) * radialForce;
              forceY += (orbitDy / orbitDist) * radialForce;
            }
            break;
        }

        // Flocking behavior: interact with nearby particles
        let neighborCount = 0;
        let avgVx = 0;
        let avgVy = 0;
        let separationX = 0;
        let separationY = 0;

        for (let j = 0; j < particlesRef.current.length; j++) {
          if (j === index) continue;
          
          const other = particlesRef.current[j];
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Interact with nearby particles
          if (dist < 80 && dist > 0) {
            neighborCount++;
            
            // Alignment: match velocity of neighbors
            avgVx += other.vx;
            avgVy += other.vy;

            // Separation: avoid crowding
            if (dist < 40) {
              separationX -= dx / dist;
              separationY -= dy / dist;
            }
          }
        }

        if (neighborCount > 0) {
          avgVx /= neighborCount;
          avgVy /= neighborCount;
          
          // Gentle alignment
          forceX += (avgVx - particle.vx) * 0.05;
          forceY += (avgVy - particle.vy) * 0.05;
          
          // Separation force
          forceX += separationX * 0.1;
          forceY += separationY * 0.1;
        }

        // Apply music intensity influence
        const speedMultiplier = 1 + (intensity.eqBands.presence + intensity.eqBands.brilliance) * 0.5;
        const bassInfluence = intensity.eqBands.bass * 0.3;
        
        // Bass creates random bursts of energy
        if (bassInfluence > 0.5 && Math.random() > 0.95) {
          particle.energy = 1;
        }
        
        // Energy-based speed boost
        const energyBoost = particle.energy * 2;
        particle.energy *= 0.98; // Energy decays

        // Apply forces to velocity
        particle.vx += forceX * speedMultiplier;
        particle.vy += forceY * speedMultiplier;

        // Speed limiting with personality
        const maxSpeed = particle.maxSpeed * (1 + energyBoost);
        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > maxSpeed) {
          particle.vx = (particle.vx / currentSpeed) * maxSpeed;
          particle.vy = (particle.vy / currentSpeed) * maxSpeed;
        }

        // Drag/friction for organic feel
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        // Particle brightness reacts to overall intensity and energy
        const alpha = particle.baseAlpha * (0.5 + intensity.totalIntensity * 0.5 + particle.energy * 0.3);

        // Draw particle with glow
        const glowSize = particle.size + particle.energy * 2;
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color + '80');
        gradient.addColorStop(1, particle.color + '00');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.5;
        ctx.fill();

        // Core particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDescentMode, intensity]);

  if (!isDescentMode) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9996] opacity-70"
    />
  );
}

// Glitch text wrapper component
export function GlitchText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { isDescentMode } = useDescentMode();
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    if (!isDescentMode) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 100);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isDescentMode]);

  if (!isDescentMode) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className={glitching ? 'animate-glitch' : ''}>{children}</div>
      {glitching && (
        <>
          <div
            className="absolute inset-0 opacity-80"
            style={{
              color: '#0ff',
              transform: 'translateX(-2px)',
              mixBlendMode: 'screen',
            }}
          >
            {children}
          </div>
          <div
            className="absolute inset-0 opacity-80"
            style={{
              color: '#f0f',
              transform: 'translateX(2px)',
              mixBlendMode: 'screen',
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

// Zooming Explorable Background
export function DescentBackground() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const [breathingPhases, setBreathingPhases] = useState({ slow: 0, medium: 0, fast: 0 });
  const baseZoom = 2.2;

  useEffect(() => {
    if (!isDescentMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to 0-1 range
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePosition({ x, y });
    };

    // Multiple breathing cycles like a living ecosystem
    let breathingInterval: number;
    const updateBreathing = () => {
      breathingInterval = requestAnimationFrame(() => {
        const time = Date.now() * 0.001; // Convert to seconds
        setBreathingPhases({
          slow: Math.sin(time * 0.15), // 20 second cycle - deep breath
          medium: Math.sin(time * 0.4), // 8 second cycle - regular breath
          fast: Math.sin(time * 1.2), // 2.6 second cycle - heartbeat
        });
        updateBreathing();
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    updateBreathing();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(breathingInterval);
    };
  }, [isDescentMode]);

  if (!isDescentMode) return null;

  // Multi-layered breathing - feels like a living organism
  const deepBreath = breathingPhases.slow * 0.08; // Deep, slow expansion ±0.08
  const regularBreath = breathingPhases.medium * 0.04; // Regular breathing ±0.04
  const heartbeat = breathingPhases.fast * 0.02; // Quick pulse ±0.02
  
  // Bass pulse - synchronized with the music
  const bassPulse = intensity.eqBands.bass * 0.05;
  
  // Mid frequencies create subtle shifts
  const midShift = (intensity.eqBands.mid + intensity.eqBands.lowMid) * 0.03;
  
  // Total zoom with organic breathing
  const totalZoom = baseZoom + deepBreath + regularBreath + heartbeat + bassPulse + midShift;

  // Calculate pan offset with organic drift
  const organicDriftX = breathingPhases.slow * 5; // Slow drift
  const organicDriftY = breathingPhases.medium * 3;
  const panX = (mousePosition.x - 0.5) * 40 + organicDriftX;
  const panY = (mousePosition.y - 0.5) * 40 + organicDriftY;

  // Color intensity breathing
  const colorPulse = 0.5 + breathingPhases.medium * 0.3 + intensity.totalIntensity * 0.2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.25 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-[9990] pointer-events-none overflow-hidden"
    >
      {/* Zoomed background with organic breathing */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          scale: totalZoom,
          x: `${panX}%`,
          y: `${panY}%`,
        }}
        transition={{
          scale: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }, // Organic easing
          x: { duration: 1.2, ease: 'easeOut' },
          y: { duration: 1.2, ease: 'easeOut' },
        }}
      />

      {/* Breathing vignette - expands and contracts */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.3) 80%, rgba(0, 0, 0, 0.5) 100%)',
          opacity: 0.8 + breathingPhases.slow * 0.2,
        }}
      />

      {/* Multi-layered pulsing color - like blood flow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, 
            transparent 40%, 
            rgba(0, 255, 255, ${0.08 * colorPulse}) 75%, 
            rgba(255, 0, 255, ${0.12 * colorPulse}) 100%)`,
          opacity: 0.5 + breathingPhases.medium * 0.3,
        }}
      />

      {/* Additional color layer that pulses with bass */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${50 + breathingPhases.slow * 10}% ${50 + breathingPhases.medium * 10}%, 
            rgba(255, 0, 255, ${intensity.eqBands.bass * 0.15}) 0%, 
            transparent 60%)`,
          mixBlendMode: 'screen',
        }}
      />
    </motion.div>
  );
}

// Main descent mode wrapper
export function DescentModeWrapper() {
  const { isDescentMode } = useDescentMode();

  return (
    <AnimatePresence>
      {isDescentMode && (
        <>
          <DescentBackground />
          <ScrollBoundaryGlow />
          <GlitchOverlay />
          <ScanlineEffect />
          <OrganicTendrils />
          <DescentParticles />
          
          {/* Vignette effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[9995]"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
            }}
          />

          {/* Pulsing color overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.03, 0.08, 0.03] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="pointer-events-none fixed inset-0 z-[9994]"
            style={{
              background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%)',
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}