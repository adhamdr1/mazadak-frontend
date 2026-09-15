import React from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Wallet, Lock } from 'lucide-react';
import { BalanceCard } from './BalanceCard';
import type { WalletData } from '../types/wallet.types';

export interface BalanceOverviewSectionProps {
  wallet: WalletData | undefined;
  isLoading: boolean;
}

export const BalanceOverviewSection: React.FC<BalanceOverviewSectionProps> = ({
  wallet,
  isLoading,
}) => {
  const { t } = useTranslation(['wallet']);

  return (
    <section className="space-y-3">
      {/* 3 Columns Grid for all screen sizes except small mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Balance */}
        <BalanceCard
          title={t('wallet:balance.total')}
          amount={wallet?.balance || '0'}
          tooltip={t('wallet:balance.totalTooltip')}
          variant="primary"
          icon={<Coins />}
          isLoading={isLoading}
        />

        {/* Available Balance */}
        <BalanceCard
          title={t('wallet:balance.available')}
          amount={wallet?.availableBalance || '0'}
          tooltip={t('wallet:balance.availableTooltip')}
          variant="success"
          icon={<Wallet />}
          isLoading={isLoading}
        />

        {/* Held Balance */}
        <BalanceCard
          title={t('wallet:balance.held')}
          amount={wallet?.heldBalance || '0'}
          tooltip={t('wallet:balance.heldTooltip')}
          variant="warning"
          icon={<Lock />}
          isLoading={isLoading}
        />
      </div>
    </section>
  );
};
