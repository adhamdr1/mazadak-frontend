import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  Home,
  MessageSquare,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { NotificationDropdown } from '@/features/notifications/components/NotificationDropdown';
import { UserAvatar } from '@/features/users';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadChatRoomsCount } from '@/features/chat';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';

export interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onOpenMobileSidebar }) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const { user } = useAuth();
  const { unreadRoomsCount } = useUnreadChatRoomsCount();

  const roleLabel = isRTL ? 'مسؤول' : 'Admin';

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
        </div>

        {/* Right: Quick Marketplace Link, Messages, Notifications & User Trigger */}
        <div className="flex items-center gap-2.5">
          {/* Direct Marketplace Link */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer shrink-0"
            title={t('layout.header.marketplace', { ns: 'admin', defaultValue: 'سوق المزادات' })}
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline-block">
              {t('layout.header.marketplace', { ns: 'admin', defaultValue: 'سوق المزادات' })}
            </span>
          </Link>

          {/* Messages Direct Link */}
          <Link
            to={ROUTES.MESSAGES}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('layout.sidebar.messages', { ns: 'admin', defaultValue: 'الرسائل' })}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadRoomsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center font-black text-[10px] leading-none px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/40">
                {toLocalizedDigits(unreadRoomsCount, isRTL)}
              </span>
            )}
          </Link>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Account Trigger Button (Matching image.png: Avatar with gold border/amber text, Role, and Menu hamburger) */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs group"
            title={user?.firstName}
            aria-label="Open Admin Menu"
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
            <Menu className="w-4 h-4 text-slate-500 group-hover:text-amber-500 transition-colors shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
