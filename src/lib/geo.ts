import { Locale } from '@/locales/types';
import { DEFAULT_LOCALE } from '@/locales';

/**
 * ISO 3166-1 alpha-2 country codes where French is an official or widely used commercial language.
 * Maintained for reference.
 */
export const FRANCOPHONE_COUNTRIES = new Set([
  'TN', // Tunisia
  'FR', // France
  'DZ', // Algeria
  'MA', // Morocco
  'BE', // Belgium
  'CH', // Switzerland
  'LU', // Luxembourg
  'MC', // Monaco
  'CA', // Canada (Quebec)
  'SN', // Senegal
  'CI', // Ivory Coast
  'CM', // Cameroon
  'MG', // Madagascar
  'ML', // Mali
  'CD', // DR Congo
  'CG', // Republic of Congo
  'GN', // Guinea
  'BF', // Burkina Faso
  'NE', // Niger
  'TG', // Togo
  'BJ', // Benin
  'GA', // Gabon
  'DJ', // Djibouti
  'KM', // Comoros
  'SC', // Seychelles
  'HT', // Haiti
  'VU', // Vanuatu
  'RW', // Rwanda
  'BI', // Burundi
]);

/**
 * Resolves the initial locale based on geo-location country code and Accept-Language header.
 * By default, English ('en') is the global default for all places unless explicitly selected by the user.
 */
export function resolveGeoLocale(
  countryCode?: string | null,
  acceptLanguage?: string | null
): Locale {
  // English ('en') is the default language for all places
  return DEFAULT_LOCALE;
}
