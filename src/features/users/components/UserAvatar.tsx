import React, { useMemo } from 'react';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface UserAvatarProps {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  userId?: string | null;
  size?: UserAvatarSize;
  isVerified?: boolean;
  isAdmin?: boolean;
  showRing?: boolean;
  variant?: 'default' | 'gold';
  className?: string;
}

const SIZE_CONFIG: Record<
  UserAvatarSize,
  {
    container: string;
    text: string;
    iconSize: string;
    badgeSize: string;
    badgeOffset: string;
  }
> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px] font-extrabold',
    iconSize: 'w-3 h-3',
    badgeSize: 'w-2.5 h-2.5 p-0.5',
    badgeOffset: '-bottom-0.5 -end-0.5',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs font-extrabold',
    iconSize: 'w-4 h-4',
    badgeSize: 'w-3 h-3 p-0.5',
    badgeOffset: '-bottom-0.5 -end-0.5',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm font-extrabold',
    iconSize: 'w-5 h-5',
    badgeSize: 'w-4 h-4 p-0.5',
    badgeOffset: 'bottom-0 end-0',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base font-black',
    iconSize: 'w-6 h-6',
    badgeSize: 'w-4.5 h-4.5 p-0.5',
    badgeOffset: 'bottom-0 end-0',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-xl font-black',
    iconSize: 'w-8 h-8',
    badgeSize: 'w-5 h-5 p-0.5',
    badgeOffset: 'bottom-0.5 end-0.5',
  },
  '2xl': {
    container: 'w-24 h-24 sm:w-28 sm:h-28',
    text: 'text-3xl sm:text-4xl font-black',
    iconSize: 'w-12 h-12',
    badgeSize: 'w-7 h-7 p-1',
    badgeOffset: 'bottom-1 end-1',
  },
};

const UNIFIED_GOLD_PALETTE =
  'bg-amber-500/10 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/20 dark:ring-amber-500/20 hover:border-amber-500 hover:ring-amber-500/40 group-hover:border-amber-500 group-hover:ring-amber-500/30';

/**
 * Extracts clean, bilingual initials (Arabic and English safe)
 */
function extractInitials(
  firstName?: string | null,
  lastName?: string | null,
  fallbackName?: string | null
): string {
  const f = firstName?.trim();
  const l = lastName?.trim();

  if (f && l) {
    return `${f[0]}${l[0]}`.toUpperCase();
  }

  if (f) {
    return f.slice(0, 2).toUpperCase();
  }

  if (fallbackName?.trim()) {
    const parts = fallbackName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  return '';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  name,
  size = 'md',
  isVerified = false,
  isAdmin = false,
  showRing = false,
  className,
}) => {
  const initials = useMemo(
    () => extractInitials(firstName, lastName, name),
    [firstName, lastName, name]
  );

  const palette = UNIFIED_GOLD_PALETTE;

  const config = SIZE_CONFIG[size];
  const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : name || 'User';

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center select-none rounded-full transition-colors duration-150',
        config.container,
        palette,
        showRing && 'ring-2 sm:ring-4 ring-amber-400/40 dark:ring-amber-400/30',
        'shadow-xs hover:scale-[1.02]',
        className
      )}
      role="img"
      aria-label={displayName}
      title={displayName}
    >
      {initials ? (
        <span className={cn('tracking-wider drop-shadow-xs font-extrabold', config.text)}>
          {initials}
        </span>
      ) : (
        <UserIcon className={cn('text-amber-500 dark:text-amber-300 drop-shadow-xs', config.iconSize)} />
      )}

      {/* Verified Shield Badge Overlay */}
      {isVerified && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs ring-2 ring-white dark:ring-slate-900',
            config.badgeSize,
            config.badgeOffset
          )}
          title="حساب موثق / Verified Account"
          aria-label="Verified"
        >
          <ShieldCheck className="w-full h-full" strokeWidth={2.5} />
        </span>
      )}

      {/* Admin Crown Badge Overlay */}
      {isAdmin && !isVerified && (
        <span
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xs ring-2 ring-white dark:ring-slate-900 font-bold',
            config.badgeSize,
            config.badgeOffset
          )}
          title="مسؤول منصة / Admin"
          aria-label="Admin"
        >
          ★
        </span>
      )}
    </div>
  );
};
