import { cn } from './ui/utils';
import type { TourDateStatus } from '../utils/tourDisplay';
import { tourStatusBadgeClass, tourStatusLabel } from '../utils/tourDisplay';

interface TourStatusBadgeProps {
  status: TourDateStatus;
  className?: string;
  /** Tour list uses 10px; ticket card uses text-xs */
  size?: 'sm' | 'md';
}

export function TourStatusBadge({ status, className, size = 'md' }: TourStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex font-medium rounded-full tracking-wide',
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        tourStatusBadgeClass(status),
        className
      )}
    >
      {tourStatusLabel(status)}
    </span>
  );
}
