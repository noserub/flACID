import { motion } from 'motion/react';
import { cn } from './ui/utils';
import {
  bodySecondary,
  gradientText,
  titleEditorial,
  titleSection,
} from '../lib/typography';

type SectionTitleSize = 'section' | 'editorial';

interface SectionTitleProps {
  children: React.ReactNode;
  /** Optional line below the title */
  subtitle?: string;
  size?: SectionTitleSize;
  className?: string;
  subtitleClassName?: string;
  /** Motion on scroll into view */
  animate?: boolean;
  align?: 'center' | 'left';
}

const titleSizes: Record<SectionTitleSize, string> = {
  section: titleSection,
  editorial: titleEditorial,
};

export function SectionTitle({
  children,
  subtitle,
  size = 'section',
  className,
  subtitleClassName,
  animate = true,
  align = 'center',
}: SectionTitleProps) {
  const heading = (
    <h2 className={cn(titleSizes[size], gradientText, className)}>{children}</h2>
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
