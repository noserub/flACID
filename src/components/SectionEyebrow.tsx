import { cn } from './ui/utils';
import { TextLabel } from './TextLabel';

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

/** @deprecated Prefer TextLabel — kept for backward compatibility. */
export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return <TextLabel className={cn('mb-3', className)}>{children}</TextLabel>;
}
