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
    text: 'text-[10px] font-bold',
    iconSize: 'w-3 h-3',
    badgeSize: 'w-2.5 h-2.5 p-0.5',
    badgeOffset: '-bottom-0.5 -end-0.5',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs font-bold',
    iconSize: 'w-4 h-4',
    badgeSize: 'w-3 h-3 p-0.5',
    badgeOffset: '-bottom-0.5 -end-0.5',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm font-bold',
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

const GRADIENT_PALETTES = [
  'bg-linear-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-amber-500/20',
  'bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 text-amber-400 border border-amber-500/30 shadow-slate-900/40',
  'bg-linear-to-br from-amber-600 via-yellow-600 to-amber-800 text-white shadow-amber-600/20',
  'bg-linear-to-br from-teal-700 via-emerald-700 to-emerald-900 text-white shadow-emerald-700/20',
  'bg-linear-to-br from-blue-900 via-slate-900 to-amber-900 text-amber-300 border border-amber-500/20 shadow-blue-900/30',
];

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

/**
 * Deterministically picks a gradient based on user string
 */
function getDeterministicPalette(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName,
  lastName,
  name,
  userId,
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

  const seed = userId || firstName || name || 'mazadak';
  const palette = useMemo(() => getDeterministicPalette(seed), [seed]);

  const config = SIZE_CONFIG[size];
  const displayName = firstName ? `${firstName} ${lastName || ''}`.trim() : name || 'User';

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center select-none rounded-full',
        config.container,
        palette,
        showRing && 'ring-2 sm:ring-4 ring-amber-400/40 dark:ring-amber-400/30',
        'shadow-md transition-transform duration-200 hover:scale-[1.02]',
        className
      )}
      role="img"
      aria-label={displayName}
      title={displayName}
    >
      {initials ? (
        <span className={cn('tracking-wider drop-shadow-xs', config.text)}>
          {initials}
        </span>
      ) : (
        <UserIcon className={cn('text-amber-300 drop-shadow-xs', config.iconSize)} />
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
