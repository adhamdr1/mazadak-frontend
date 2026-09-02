import React from 'react';
import { cn } from '@/utils/cn';

export interface AuctionDetailSkeletonProps {
  className?: string;
}

export const AuctionDetailSkeleton: React.FC<AuctionDetailSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('animate-pulse space-y-6 max-w-7xl mx-auto w-full', className)}>
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (Images + Info + Description) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Main Image */}
          <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-800 rounded-3xl" />

          {/* Thumbnails */}
          <div className="flex gap-2.5">
            <div className="w-24 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="w-24 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="w-24 h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>

          {/* Title & Info Section */}
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>

          {/* Description Card */}
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>

        {/* Right Column (CTA Sidebar + Seller) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailSkeleton;
