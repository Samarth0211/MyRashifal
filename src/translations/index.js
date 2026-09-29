import en from './en';
import hi from './hi';
import mr from './mr';

export const translations = { en, hi, mr };
export const SUPPORTED_LANGS = [
  { code: 'en', label: 'EN', nativeLabel: 'English' },
  { code: 'hi', label: 'हिं', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'मर', nativeLabel: 'मराठी' },
];
export const DEFAULT_LANG = 'mr';
