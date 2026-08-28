import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Laptop,
  Shirt,
  Gem,
  Watch,
  Landmark,
  Palette,
  Trophy,
  BookOpen,
  Armchair,
  Tv,
  Car,
  Bike,
  Building2,
  Dumbbell,
  Gamepad2,
  Tag,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { AuctionCategory } from '../../types/auctions.types';

export interface CategoryBadgeProps {
  category: AuctionCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'overlay';
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const CATEGORY_ICONS_MAP: Record<AuctionCategory, React.ElementType> = {
  ELECTRONICS: Laptop,
  FASHION: Shirt,
  JEWELRY: Gem,
  WATCHES: Watch,
  ANTIQUES: Landmark, // Antiquities & Heritage Landmark Icon
  ART: Palette,
  COLLECTIBLES: Trophy,
  BOOKS: BookOpen,
  FURNITURE: Armchair,
  HOME_APPLIANCES: Tv,
  CARS: Car,
  MOTORCYCLES: Bike,
  REAL_ESTATE: Building2,
  SPORTS: Dumbbell,
  TOYS: Gamepad2,
  OTHER: Tag,
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
  variant = 'pill',
  className,
  onClick,
  isActive = false,
}) => {
  const { t } = useTranslation('auctions');
  const IconComponent = CATEGORY_ICONS_MAP[category] || Tag;

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3.5 py-1.5 gap-2',
    lg: 'text-sm px-4 py-2 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const getVariantStyles = () => {
    if (variant === 'overlay') {
      return 'bg-white/95 text-slate-800 border-slate-200 shadow-sm backdrop-blur-md font-semibold dark:bg-slate-900/90 dark:text-white dark:border-slate-700/80 dark:shadow-md';
    }
    if (isActive) {
      return 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm';
    }
    return 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-medium';
  };

  const getIconColor = () => {
    if (variant === 'overlay') {
      return 'text-amber-500 dark:text-amber-400 stroke-2';
    }
    if (isActive) {
      return 'text-slate-950 stroke-[2.5]'; // Thick, prominent dark navy icon when active
    }
    return 'text-amber-500 stroke-2';
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-xl transition-colors duration-150 select-none border leading-normal',
        sizeStyles[size],
        getVariantStyles(),
        onClick && 'cursor-pointer',
        className
      )}
    >
      {showIcon && (
        <IconComponent
          className={cn(
            'shrink-0',
            getIconColor(),
            iconSizes[size]
          )}
        />
      )}
      <span className="truncate leading-normal pt-0.5">{t(`categories.${category}`)}</span>
    </span>
  );
};

export default CategoryBadge;
