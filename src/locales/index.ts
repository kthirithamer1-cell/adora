import { Locale, TranslationDictionary } from './types';
import { fr } from './fr';
import { en } from './en';

export * from './types';
export { fr } from './fr';
export { en } from './en';

export const DEFAULT_LOCALE: Locale = 'fr';
export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en'];

export const dictionaries: Record<Locale, TranslationDictionary> = {
  fr,
  en,
};

export function getDictionary(locale: Locale): TranslationDictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && (locale === 'fr' || locale === 'en');
}
