import { cn } from '../../lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-z-surface-2 rounded animate-pulse-subtle',
        className
      )}
      aria-hidden="true"
    />
  );
}

/** Skeleton matching the StatTile layout */
export function StatTileSkeleton() {
  return (
    <div className="border border-z-border p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-2.5 w-28" />
    </div>
  );
}

/** Skeleton matching a table row */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-z-border-subtle">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-16 rounded-none" />
      <Skeleton className="h-3 w-32 flex-1" />
      <Skeleton className="h-6 w-20" />
    </div>
  );
}
