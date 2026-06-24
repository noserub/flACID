import { cn } from './ui/utils';
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
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            variant === 'editorial'
              ? 'radial-gradient(ellipse 80% 55% at 18% 30%, rgba(147,51,234,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 85% 70%, rgba(74,222,128,0.06) 0%, transparent 50%)'
              : 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(147,51,234,0.1) 0%, transparent 58%)',
        }}
        aria-hidden
      />
    </>
  );
}
