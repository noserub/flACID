import { motion, AnimatePresence } from 'motion/react';

interface OptimizedAnimationProps {
  children: React.ReactNode;
  isVisible: boolean;
}

/**
 * Optimized animation wrapper with will-change hints for GPU acceleration.
 * Use for conditional content that animates in/out.
 */
export function OptimizedAnimation({ children, isVisible }: OptimizedAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
