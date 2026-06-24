import { cn } from './ui/utils';
import { ambientClass } from '../lib/colors';
import { brandSectionWashClass } from '../lib/brandClasses';

interface SectionAmbientProps {
  className?: string;
  /** Stronger purple wash for editorial sections (About). */
  variant?: 'default' | 'editorial';
}

/** Cosmic grain + gradient wash shared across below-the-fold sections. */
export function SectionAmbient({ className, variant = 'default' }: SectionAmbientProps) {
  return (
    <>
      <div className={cn('pointer-events-none absolute inset-0', brandSectionWashClass)} aria-hidden />
      <div
        className={cn('pointer-events-none absolute inset-0 section-cosmic-grain', className)}
        aria-hidden
      />
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          variant === 'editorial' ? ambientClass.editorial : ambientClass.default
        )}
        aria-hidden
      />
    </>
  );
}
