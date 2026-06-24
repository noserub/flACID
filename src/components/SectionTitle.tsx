import { motion } from 'motion/react';
import { cn } from './ui/utils';
import {
  bodySecondary,
  titleEditorial,
  titleEditorialAccent,
  titleEditorialGradient,
  titleSection,
  titleSectionAccent,
  titleSectionGradient,
} from '../lib/typography';

type SectionTitleSize = 'section' | 'editorial';
type SectionTitleVariant = 'accent' | 'gradient' | 'solid';

interface SectionTitleProps {
  children: React.ReactNode;
  subtitle?: string;
  size?: SectionTitleSize;
  /** accent = pink (default); gradient = brand ramp (Visuals); solid = foreground */
  variant?: SectionTitleVariant;
  className?: string;
  subtitleClassName?: string;
  animate?: boolean;
  align?: 'center' | 'left';
}

const titleSizes: Record<SectionTitleSize, Record<SectionTitleVariant, string>> = {
  section: {
    accent: titleSectionAccent,
    gradient: titleSectionGradient,
    solid: cn(titleSection, 'text-foreground'),
  },
  editorial: {
    accent: titleEditorialAccent,
    gradient: titleEditorialGradient,
    solid: cn(titleEditorial, 'text-foreground'),
  },
};

export function SectionTitle({
  children,
  subtitle,
  size = 'section',
  variant = 'accent',
  className,
  subtitleClassName,
  animate = true,
  align = 'center',
}: SectionTitleProps) {
  const heading = (
    <h2 className={cn(titleSizes[size][variant], className)}>{children}</h2>
  );

  const content = (
    <div className={cn('space-y-3 md:space-y-4', align === 'left' && 'text-left')}>
      {heading}
      {subtitle && (
        <p
          className={cn(
            bodySecondary,
            'font-light max-w-2xl',
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
