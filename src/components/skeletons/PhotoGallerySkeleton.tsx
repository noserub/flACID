import { Skeleton } from '../ui/skeleton';

interface PhotoGallerySkeletonProps {
  count?: number;
  className?: string;
}

export function PhotoGallerySkeleton({ count = 6, className }: PhotoGallerySkeletonProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className ?? ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
