import { motion } from 'motion/react';
import { cn } from './ui/utils';

type SectionTitleVariant = 'gradient' | 'clean';

interface SectionTitleProps {
  children: React.ReactNode;
  /** Optional line below the title */
  subtitle?: string;
  variant?: SectionTitleVariant;
  className?: string;
  subtitleClassName?: string;
  /** Motion on scroll into view */
  animate?: boolean;
  align?: 'center' | 'left';
}

const titleVariants: Record<SectionTitleVariant, string> = {
  gradient:
    'bg-gradient-to-r from-signal-purple-bright via-hot-pink to-neon-green bg-clip-text text-transparent',
  clean: 'text-foreground',
};

export function SectionTitle({
  children,
  subtitle,
  variant = 'gradient',
  className,
  subtitleClassName,
  animate = true,
  align = 'center',
}: SectionTitleProps) {
  const heading = (
    <h2
      className={cn(
        'font-hero text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight',
        titleVariants[variant],
        className
      )}
    >
      {children}
    </h2>
  );

  const content = (
    <div className={cn('space-y-3 md:space-y-4', align === 'left' && 'text-left')}>
      {heading}
      {subtitle && (
        <p
          className={cn(
            'text-muted-foreground text-base md:text-lg font-light max-w-2xl',
            align === 'center' ? 'mx-auto' : 'mx-0',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );

  if (!animate) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  );
}
