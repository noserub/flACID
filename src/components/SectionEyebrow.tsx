import { cn } from './ui/utils';

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** High-contrast section label — readable on void backgrounds. */
export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <p
      className={cn(
        'mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-neon-green',
        className
      )}
    >
      {children}
    </p>
  );
}
