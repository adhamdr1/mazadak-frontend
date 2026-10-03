import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arCommon from '@/locales/ar/common.json';
import arAuth from '@/locales/ar/auth.json';
import arAuctions from '@/locales/ar/auctions.json';
import arBids from '@/locales/ar/bids.json';
import arWallet from '@/locales/ar/wallet.json';
import arEscrow from '@/locales/ar/escrow.json';
import arChat from '@/locales/ar/chat.json';
import arNotifications from '@/locales/ar/notifications.json';
import arReviews from '@/locales/ar/reviews.json';
import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enAuctions from '@/locales/en/auctions.json';
import enBids from '@/locales/en/bids.json';
import enWallet from '@/locales/en/wallet.json';
import enEscrow from '@/locales/en/escrow.json';
import enChat from '@/locales/en/chat.json';
import enNotifications from '@/locales/en/notifications.json';
import enReviews from '@/locales/en/reviews.json';

export const defaultNS = 'common';
export const resources = {
  ar: {
    common: arCommon,
    auth: arAuth,
    auctions: arAuctions,
    bids: arBids,
    wallet: arWallet,
    escrow: arEscrow,
    chat: arChat,
    notifications: arNotifications,
    reviews: arReviews,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    auctions: enAuctions,
    bids: enBids,
    wallet: enWallet,
    escrow: enEscrow,
    chat: enChat,
    notifications: enNotifications,
    reviews: enReviews,
  },
} as const;

export function updateDocumentDirection(lng: string) {
  const isRTL = lng.startsWith('ar');
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = isRTL ? 'ar' : 'en';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS,
    interpolation: {
      escapeValue: false, // React already escapes values safely
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mazadak_language',
    },
  });

// Apply document direction initially and on language changes
updateDocumentDirection(i18n.language || 'ar');
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
