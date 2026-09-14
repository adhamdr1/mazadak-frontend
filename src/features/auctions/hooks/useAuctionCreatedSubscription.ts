import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { auctionsService } from '../services/auctions.service';
import { QUERY_KEYS } from '@/constants/queryKeys.constants';
import { useToast } from '@/components/feedback/useToast';
import type { Auction } from '../types/auctions.types';

export interface UseAuctionCreatedSubscriptionOptions {
  enabled?: boolean;
  showToastNotification?: boolean;
  onAuctionCreated?: (auction: Auction) => void;
}

export function useAuctionCreatedSubscription(
  options: UseAuctionCreatedSubscriptionOptions = {}
) {
  const { enabled = true, showToastNotification = true, onAuctionCreated } = options;
  const queryClient = useQueryClient();
  const { t } = useTranslation('auctions');
  const { toast } = useToast();

  const [newAuctions, setNewAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = auctionsService.subscribeToAuctionCreated((newAuction: Auction) => {
      setNewAuctions((prev) => {
        // Prevent duplicate entries for the same auction ID
        if (prev.some((a) => a._id === newAuction._id)) return prev;
        return [newAuction, ...prev];
      });

      // Optional Toast notification for instant awareness
      if (showToastNotification) {
        toast.info(t('feed.newAuctionToast', { title: newAuction.title }), {
          duration: 5000,
        });
      }

      if (onAuctionCreated) {
        onAuctionCreated(newAuction);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, showToastNotification, onAuctionCreated, toast, t]);

  const refreshFeed = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUCTIONS.ALL });
    setNewAuctions([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [queryClient]);

  const dismiss = useCallback(() => {
    setNewAuctions([]);
  }, []);

  return {
    newAuctions,
    newAuctionsCount: newAuctions.length,
    latestAuction: newAuctions[0] || null,
    hasNewAuctions: newAuctions.length > 0,
    refreshFeed,
    dismiss,
  };
}

export default useAuctionCreatedSubscription;
