/**
 * ChatRoomsSkeleton Component
 * Polished shimmer placeholder cards for the messages page
 */

import React from 'react';

interface ChatRoomsSkeletonProps {
  count?: number;
}

export const ChatRoomsSkeleton: React.FC<ChatRoomsSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="space-y-3" role="status" aria-label="Loading chat conversations">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
        >
          {/* Thumbnail Skeleton */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

          {/* Details Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 sm:h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/5" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/5" />
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
