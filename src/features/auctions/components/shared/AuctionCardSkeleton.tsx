import React from 'react';
import { cn } from '@/utils/cn';

export interface AuctionCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
  className?: string;
}

export const AuctionCardSkeleton: React.FC<AuctionCardSkeletonProps> = ({
  viewMode = 'grid',
  count = 1,
  className,
}) => {
  const isListView = viewMode === 'list';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col',
            isListView ? 'md:flex-row md:items-stretch' : 'w-full',
            className
          )}
        >
          {/* Image Skeleton */}
          <div
            className={cn(
              'bg-slate-200 dark:bg-slate-800 shrink-0 relative',
              isListView ? 'w-full md:w-72 lg:w-80 h-56 md:h-auto' : 'w-full aspect-[4/3] sm:aspect-[16/10]'
            )}
          >
            <div className="absolute top-3 inset-x-3 flex justify-between">
              <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700 rounded-full" />
              <div className="h-5 w-16 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="absolute bottom-3 start-3">
              <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-2.5">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
              <div className="space-y-1.5">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
              <div className="space-y-1">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AuctionCardSkeleton;
