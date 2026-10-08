import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NotificationDropdown } from '@/features/notifications/components/NotificationDropdown';
import { UserAvatar } from '@/features/users';
import { useAuth } from '@/hooks/useAuth';

export interface AdminHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ isOpen, onToggle }) => {
  const { i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { user } = useAuth();

  const roleLabel = isRTL ? 'مسؤول' : 'Admin';

  return (
    <header className="lg:hidden sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
        </div>

        {/* Right: Notifications & User Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Account Trigger Button */}
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
            title={user?.firstName}
            aria-label="Toggle Admin Menu"
            aria-expanded={isOpen}
          >
            <UserAvatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              userId={user?._id}
              size="xs"
              variant="gold"
            />
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
              {roleLabel}
            </span>
            {isOpen ? (
              <X className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Menu className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors shrink-0" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
