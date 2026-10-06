import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export type KpiVariant = 'gold' | 'emerald' | 'rose' | 'cyan' | 'purple' | 'blue' | 'slate';

export interface StatKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  variant?: KpiVariant;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  isLoading?: boolean;
  href?: string;
  className?: string;
}

const variantStyles: Record<
  KpiVariant,
  {
    iconBg: string;
    iconColor: string;
    borderGlow: string;
  }
> = {
  gold: {
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500 dark:text-amber-400',
    borderGlow: 'hover:border-amber-500/40',
  },
  emerald: {
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    borderGlow: 'hover:border-emerald-500/40',
  },
  rose: {
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-500 dark:text-rose-400',
    borderGlow: 'hover:border-rose-500/40',
  },
  cyan: {
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    borderGlow: 'hover:border-cyan-500/40',
  },
  purple: {
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-500 dark:text-purple-400',
    borderGlow: 'hover:border-purple-500/40',
  },
  blue: {
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500 dark:text-blue-400',
    borderGlow: 'hover:border-blue-500/40',
  },
  slate: {
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    borderGlow: 'hover:border-slate-300 dark:hover:border-slate-700',
  },
};

export const StatKpiCard: React.FC<StatKpiCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'gold',
  trend,
  isLoading = false,
  href,
  className,
}) => {
  const styles = variantStyles[variant];

  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5',
        styles.borderGlow,
        className
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-4">
        {/* Metric Information */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>

          {isLoading ? (
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
          ) : (
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {value}
            </h3>
          )}

          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 text-xs font-semibold pt-1">
              {trend.isPositive !== false ? (
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-500 font-bold">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trend.value}
                </span>
              )}
              {trend.label && <span className="text-slate-400 font-normal">{trend.label}</span>}
            </div>
          )}
        </div>

        {/* Icon & Hover Link Indicator */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-200 group-hover:scale-105',
              styles.iconBg,
              styles.iconColor
            )}
          >
            <Icon className="w-6 h-6" />
          </div>

          {href && (
            <ArrowUpRight className="w-4 h-4 text-slate-400 transition-colors group-hover:text-amber-500" />
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
};
