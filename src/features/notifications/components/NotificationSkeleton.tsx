import React from 'react';
import { cn } from '@/utils/cn';

export interface NotificationSkeletonProps {
  count?: number;
  className?: string;
}

export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({
  count = 5,
  className,
}) => {
  return (
    <div className={cn('divide-y divide-slate-100/90 dark:divide-slate-800/70', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 p-4 sm:p-5 select-none overflow-hidden">
          {/* Icon Badge Skeleton */}
          <div className="w-11 h-11 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse shrink-0 mt-0.5" />

          {/* Text Content Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 bg-slate-200/90 dark:bg-slate-800 rounded-md w-1/3 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
            </div>
            <div className="h-3.5 bg-slate-100/90 dark:bg-slate-800/60 rounded-md w-4/5 animate-pulse" />
            <div className="h-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-md w-2/5 animate-pulse" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/40 rounded w-20 mt-2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
