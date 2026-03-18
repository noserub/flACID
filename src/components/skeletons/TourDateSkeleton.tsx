import { Skeleton } from '../ui/skeleton';

interface TourDateSkeletonProps {
  count?: number;
  className?: string;
}

export function TourDateSkeleton({ count = 6, className }: TourDateSkeletonProps) {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 rounded-lg border border-border"
        >
          <div className="flex items-center gap-3 md:w-48">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="hidden md:block">
            <Skeleton className="w-px h-12" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
