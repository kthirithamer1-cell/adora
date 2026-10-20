import { Locale } from '@/locales/types';

/**
 * ISO 3166-1 alpha-2 country codes where French is an official or widely used commercial language.
 * Visitors from these countries automatically default to French ('fr') unless they manually override it.
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
 *
 * Logic:
 * 1. If country code is known and francophone -> 'fr'
 * 2. If country code is known and not francophone -> 'en'
 * 3. If country code is unknown (e.g. localhost, local proxies, private IPs):
 *    - Check Accept-Language header
 *    - If acceptLanguage starts with or includes 'fr' -> 'fr'
 *    - Otherwise fallback to 'fr' (MarkMosaiq primary domestic market is Tunisia)
 */
export function resolveGeoLocale(
  countryCode?: string | null,
  acceptLanguage?: string | null
): Locale {
  if (countryCode && countryCode.length === 2 && countryCode !== 'XX') {
    const upperCountry = countryCode.toUpperCase();
    if (FRANCOPHONE_COUNTRIES.has(upperCountry)) {
      return 'fr';
    }
    return 'en';
  }

  // Fallback to browser Accept-Language header
  if (acceptLanguage) {
    const lowerHeader = acceptLanguage.toLowerCase();
    const firstLanguage = lowerHeader.split(',')[0]?.trim();
    if (firstLanguage?.startsWith('fr')) {
      return 'fr';
    }
    if (firstLanguage?.startsWith('en')) {
      return 'en';
    }
  }

  // Final domestic default for MarkMosaiq
  return 'fr';
}
