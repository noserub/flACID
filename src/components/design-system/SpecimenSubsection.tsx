import { bodySecondary, specimenTitle } from '../../lib/typography';
import { cn } from '../ui/utils';

interface SpecimenSubsectionProps {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SpecimenSubsection({
  id,
  title,
  description,
  children,
  className,
}: SpecimenSubsectionProps) {
  return (
    <div
      id={id}
      className={cn(
        'scroll-mt-36 space-y-4 border-t border-border/40 pt-8 first:border-t-0 first:pt-0',
        className
      )}
    >
      <div>
        <h3 className={cn(specimenTitle, 'text-lg')}>{title}</h3>
        {description && (
          <p className={cn(bodySecondary, 'mt-1.5 max-w-2xl text-sm')}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
