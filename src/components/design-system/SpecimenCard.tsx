import { bodySecondary, specimenTitle } from '../../lib/typography';
import { cn } from '../ui/utils';
import { TextLabel } from '../TextLabel';

interface SpecimenCardProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SpecimenCard({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: SpecimenCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-36 rounded-2xl border border-signal-purple/30 bg-card/95 p-6 sm:p-8',
        'shadow-card',
        className
      )}
    >
      {eyebrow && <TextLabel className="mb-2">{eyebrow}</TextLabel>}
      <h2 className={specimenTitle}>{title}</h2>
      {description && (
        <p className={cn(bodySecondary, 'mt-2 max-w-2xl')}>
          {description}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}
