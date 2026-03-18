import { Skeleton } from '../ui/skeleton';

interface AlbumCardSkeletonProps {
  count?: number;
  className?: string;
}

export function AlbumCardSkeleton({ count = 6, className }: AlbumCardSkeletonProps) {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${className ?? ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
