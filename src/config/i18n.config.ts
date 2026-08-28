import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arCommon from '@/locales/ar/common.json';
import arAuth from '@/locales/ar/auth.json';
import arAuctions from '@/locales/ar/auctions.json';
import enCommon from '@/locales/en/common.json';
import enAuth from '@/locales/en/auth.json';
import enAuctions from '@/locales/en/auctions.json';

export const defaultNS = 'common';
export const resources = {
  ar: {
    common: arCommon,
    auth: arAuth,
    auctions: arAuctions,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    auctions: enAuctions,
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
