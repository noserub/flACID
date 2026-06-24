import { motion } from 'motion/react';
import { cn } from './ui/utils';
import { SectionTitle } from './SectionTitle';
import { TextLabel } from './TextLabel';

type SectionHeaderLayout = 'centered' | 'editorial';
type SectionHeaderSize = 'section' | 'editorial';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  layout?: SectionHeaderLayout;
  size?: SectionHeaderSize;
  className?: string;
  animate?: boolean;
}

/** Unified section header — eyebrow + title + optional subtitle. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  layout = 'centered',
  size = 'section',
  className,
  animate = true,
}: SectionHeaderProps) {
  const isEditorial = layout === 'editorial';

  const content = (
    <div
      className={cn(
        'space-y-3 md:space-y-4',
        isEditorial ? 'text-left' : 'text-center',
        className
      )}
    >
      {eyebrow && <TextLabel className="mb-3">{eyebrow}</TextLabel>}
      <SectionTitle
        subtitle={subtitle}
        size={size}
        align={isEditorial ? 'left' : 'center'}
        animate={false}
      >
        {title}
      </SectionTitle>
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
