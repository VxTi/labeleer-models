import type { ISO639_1LanguageCode } from './locales';

/**
 * Set of language codes that are written in right-to-left (RTL) scripts.
 */
const rtlLanguages = new Set<ISO639_1LanguageCode>([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'yi', // Yiddish
  'ku', // Kurdish
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
  'dv', // Dhivehi/Maldivian
  'ks', // Kashmiri
]);

/**
 * Determines if a given locale corresponds to a right-to-left (RTL) language.
 *
 * @param language - The `ISO 639-1` language code to check.
 * @returns `true` if the locale is RTL, `false` otherwise.
 */
export function isRtlLanguage(language: ISO639_1LanguageCode | undefined) {
  return !!language && rtlLanguages.has(language);
}
