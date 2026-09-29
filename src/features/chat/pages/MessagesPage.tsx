/**
 * MessagesPage Component
 * Inbox page displaying all chat rooms for the authenticated user (/messages)
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useMyRooms } from '../hooks/useMyRooms';
import { ChatRoomCard } from '../components/ChatRoomCard';
import { ChatRoomsSkeleton } from '../components/ChatRoomsSkeleton';
import { Button } from '@/components/common/Button';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ROUTES } from '@/constants/routes.constants';
import { toLocalizedDigits } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export const MessagesPage: React.FC = () => {
  const { t, i18n } = useTranslation(['chat', 'common']);
  const isRTL = i18n.language?.startsWith('ar');
  const navigate = useNavigate();

  const {
    rooms,
    total,
    totalPages,
    page,
    setPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyRooms({ limit: 12 });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Header Section: Title, Subtitle, CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('chat:messages.pageTitle', 'الرسائل والمحادثات')}
            </h1>
            {total > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {toLocalizedDigits(total, isRTL)}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'chat:messages.chatSub',
              'محادثات مباشرة وآمنة بين البائع والمشتري الفائز لتنسيق الاستلام وتأكيد المعاينة.'
            )}
          </p>
        </div>

        {/* Action Button: Explore Auctions */}
        <Link
          to={ROUTES.AUCTIONS}
          className={cn(
            'group relative inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex-shrink-0',
            'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950',
            'shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98]',
            'transition-all duration-300 w-full sm:w-auto overflow-hidden select-none'
          )}
        >
          <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>{t('chat:messages.browseAuctions', 'استكشف المزادات')}</span>
          <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </Link>
      </div>

      {/* 2. Content Area */}
      {isLoading ? (
        <ChatRoomsSkeleton count={5} />
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <div className="text-base font-black text-rose-900 dark:text-rose-200">
              {t('chat:messages.errorTitle', 'تعذر تحميل المحادثات')}
            </div>
            <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-400 max-w-md mx-auto">
              {error || t('chat:messages.errorMessage', 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="font-bold border-rose-300 dark:border-rose-800"
          >
            {t('common:actions.retry', isRTL ? 'إعادة المحاولة' : 'Try Again')}
          </Button>
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="w-10 h-10 text-amber-500" />}
          title={t('chat:messages.empty', 'لا توجد محادثات بعد')}
          description={t(
            'chat:messages.emptyDescription',
            'عند فوزك بمزاد أو بيع سلعتك، ستفتح قنوات الدردشة المباشرة هنا للتنسيق مع الطرف الآخر.'
          )}
          action={{
            label: t('chat:messages.browseAuctions', 'استكشف المزادات الحية'),
            onClick: () => {
              navigate(ROUTES.AUCTIONS);
            },
          }}
        />
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <ChatRoomCard key={room.auctionId} room={room} />
          ))}

          {/* Pagination Component (Displayed when totalPages > 1) */}
          {totalPages > 1 && (
            <div className="pt-6 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={12}
                onPageChange={setPage}
                showSummary={true}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Security & Trust Information Banner */}
      <div className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 p-6 sm:p-8 space-y-6 shadow-sm transition-all duration-300">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {t('chat:messages.banner.title', 'نظام المحادثات المباشر في مزادك')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {t(
                'chat:messages.banner.body',
                'تواصل مباشرةً وأرسل الصور لتأكيد حالة السلعة وتفاصيل الاستلام. جميع الرسائل مشفرة ومحمية بسجل تدقيق لحفظ حقوق المشتري والبائع في حالة فتح أي نزاع مالي.'
              )}
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('chat:messages.banner.point1', 'خصوصية تامة بين البائع والفائز')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('chat:messages.banner.point2', 'تحديثات حية وإشعارات قراءة فورية')}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 group-hover:border-amber-500/20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              {t('chat:messages.banner.point3', 'سجل موثق لحماية المعاملات والضمان')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
