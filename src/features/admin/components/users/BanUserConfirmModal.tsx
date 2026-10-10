import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { UserAvatar } from '@/features/users';
import type { User } from '../../types/admin.types';

export interface BanUserConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  isBanned: boolean;
  user?: User | null;
  userName?: string;
  userEmail?: string;
}

export const BanUserConfirmModal: React.FC<BanUserConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isBanned,
  user,
  userName = '',
  userEmail = '',
}) => {
  const { t, i18n } = useTranslation(['admin', 'common']);
  const isRTL = i18n.language?.startsWith('ar');

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : userName;
  const displayEmail = user?.email || userEmail;

  const title = isBanned
    ? t('users.unbanModal.title', { defaultValue: 'تأكيد إلغاء حظر المستخدم' })
    : t('users.banModal.title', { defaultValue: 'تأكيد حظر المستخدم' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4 py-1">
        {/* 1. Consequence Notice Banner */}
        <div
          className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-colors ${
            isBanned
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isBanned
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isBanned ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="space-y-1 min-w-0">
            <h4 className="font-bold text-sm tracking-tight">
              {isBanned
                ? t('users.unbanModal.heading', { defaultValue: 'إعادة تفعيل الحساب' })
                : t('users.banModal.heading', { defaultValue: 'إجراء حظر الحساب' })}
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              {isBanned
                ? t('users.unbanModal.desc', {
                    defaultValue: 'سيتمكن المستخدم من تسجيل الدخول والمزايدة وإنشاء المزادات فوراً بعد إلغاء الحظر.',
                  })
                : t('users.banModal.desc', {
                    defaultValue: 'سيتم طرد المستخدم ومنعه فوراً من تسجيل الدخول أو المزايدة أو إجراء أي تعاملات مالية على المنصة.',
                  })}
            </p>
          </div>
        </div>

        {/* 2. Premium User Identity Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">
              <UserAvatar
                firstName={user?.firstName || displayName.split(' ')[0] || ''}
                lastName={user?.lastName || displayName.split(' ')[1] || ''}
                userId={user?._id}
                size="md"
              />
            </div>
            <div className="min-w-0 text-start">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {displayName || '—'}
                </span>
                {user?.authProvider === 'GOOGLE' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    Google
                  </span>
                )}
              </div>
              {displayEmail && (
                <div
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5"
                  title={displayEmail}
                >
                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                  <span className="truncate">{displayEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Current Status Pill */}
          <div className="shrink-0">
            {isBanned ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>{isRTL ? 'محظور حالياً' : 'Currently Banned'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isRTL ? 'نشط حالياً' : 'Currently Active'}</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Footer: Note on start, Actions on end facing each other */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Note on Start side */}
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>
              {isBanned
                ? t('users.unbanModal.note', {
                    defaultValue: isRTL
                      ? 'يمكنك إعادة الحظر في أي وقت عند الحاجة.'
                      : 'You can re-ban anytime if needed.',
                  })
                : t('users.banModal.alert', {
                    defaultValue: isRTL
                      ? 'يمكنك إلغاء الحظر في أي وقت لاحقاً.'
                      : 'You can unban anytime later.',
                  })}
            </span>
          </div>

          {/* Buttons on End side */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-bold"
            >
              {t('common:cancel', { defaultValue: 'إلغاء' })}
            </Button>

            <Button
              type="button"
              variant={isBanned ? 'primary' : 'danger'}
              size="sm"
              isLoading={isLoading}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs ${
                isBanned ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''
              }`}
            >
              {isBanned
                ? t('users.unbanModal.confirm', { defaultValue: 'تأكيد إلغاء الحظر' })
                : t('users.banModal.confirm', { defaultValue: 'تأكيد الحظر' })}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BanUserConfirmModal;
