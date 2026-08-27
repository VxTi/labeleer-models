import { Locales, type Locale } from './dataset';

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

const nonPluralLocales = new Set<Locale>([
  // East & Southeast Asian
  'ja_JP',
  'ko_KR',
  'zh_CN',
  'zh_TW',
  'zh_HK',
  'zh_SG',
  'vi_VN',
  'th_TH',
  'km_KH',
  'lo_LA',
  'my_MM',
  'id_ID',
  'ms_MY',
  'ms_BN',

  // Turkic & Uralic
  'tr_TR',
  'az_AZ',
  'hu_HU',
  'uz_UZ',
  'kk_KZ',
  'ug_CN',
  'ky_KG',
  'tk_TM',

  // Dravidian & Other Asian
  'kn_IN',
  'bo_CN',
  'bo_IN',
  'dz_BT',

  // African & Indigenous
  'yo_NG',
  'yo_BJ',
  'wo_SN',
  'su_ID',
  'jv_ID',
  'gug_PY',

  // Persian / Iranian
  'fa_IR',
  'fa_AF',
]);

export type InferBCP47Locale<T extends string> =
  T extends `${infer Lang}_${infer Region}` ? `${Lang}-${Region}` : never;

export type InferPosixFromBCP47Locale<T extends BCP47Locale> =
  T extends `${infer First}-${infer Second}` ? `${First}_${Second}` : never;

export type InferISO639_1LanguageCode<T extends string> =
  T extends `${infer Lang}_${infer _Region}` ? Lang : never;

export type InferISO639_1RegionCode<T extends string> =
  T extends `${infer _Lang}_${infer Region}` ? Region : never;

/**
 * @see [MDN - BCP 47](https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag)
 */
export type BCP47Locale = InferBCP47Locale<Locale>;

/**
 * @see [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1)
 */
export type ISO639_1LanguageCode = InferISO639_1LanguageCode<Locale>;

export type CountryCode = InferISO639_1RegionCode<Locale>;

/**
 * Checks whether the provided value is a valid `ISO 639-1` language code.
 * A valid `ISO 639-1` code is a two-letter code representing a language (e.g., "en" for English).
 *
 * @param value - The string to check.
 * @returns True if the value is a valid `ISO 639-1` language code, false otherwise.
 */
export function isISO639_1LanguageCode(
  value: string | undefined
): value is ISO639_1LanguageCode {
  if (!value) return false;

  const iso639_1Codes = Locales.map(loc => loc.split('_')[0]);
  return iso639_1Codes.includes(value);
}

/**
 * Converts a given Locale to its corresponding `ISO 639-1` language code.
 *
 * @param locale - The Locale to convert (e.g., `en_US`).
 * @returns The ISO 639-1 language code (e.g., `"en"`).
 */
export function toISO639_1LanguageCode(locale: Locale): ISO639_1LanguageCode {
  return locale.split('_')[0] as ISO639_1LanguageCode;
}

/**
 * Converts an `ISO 639-1` language code to a corresponding Locale.
 * If multiple Locales exist for the same language code, the first match is returned.
 *
 * @param languageCode - The `ISO 639-1` language code (e.g., `"en"`).
 * @returns The corresponding Locale (e.g., `en_US`), or null if not found.
 */
export function iso639_1ToLocale(languageCode: ISO639_1LanguageCode): Locale {
  // Will always find something, as ISO639_1 type is derived from Locales
  const foundLocale: Locale | undefined = Locales.find((loc: Locale) =>
    loc.startsWith(`${languageCode}_`)
  );

  if (!foundLocale) {
    throw new Error(`Failed to extract locale from ${languageCode}`);
  }

  return foundLocale;
}

/**
 * Checks whether the provided value is a valid `BCP 47` locale string.
 * A valid `BCP 47` locale string follows the format "language-region" (e.g., "en-US").
 *
 * @param value - The string to check.
 * @returns True if the value is a valid `BCP 47` locale string, false otherwise.
 */
export function isBCP47Locale(value: string | undefined): value is BCP47Locale {
  if (!value) return false;

  const bcp47Locales = Locales.map(loc => loc.replace('_', '-'));
  return (bcp47Locales as readonly string[]).includes(value);
}

/**
 * Converts a POSIX locale string (used in Unix-like systems, e.g., `"en_US"`)
 * to `BCP 47` (Best Common Practice for Language Tags, e.g., `"en-US"`) format.
 *
 * @param posixLocale - The POSIX locale string (e.g., `"en_US"`).
 * @returns The `BCP 47` locale string (e.g., `"en-US"`).
 */
export function toBCP47<TLocale extends Locale>(
  posixLocale: TLocale
): InferBCP47Locale<TLocale> {
  return posixLocale.replace('_', '-') as InferBCP47Locale<TLocale>;
}

/**
 * Converts a `BCP 47` (Best Common Practice for Language Tags, e.g., `"en-US"`)
 * locale string to POSIX format (used in Unix-like systems, e.g., `"en_US"`).
 *
 * @param locale - The `BCP 47` locale string (e.g., `"en-US"`).
 * @returns The `POSIX` locale string (e.g., `"en_US"`).
 */
export function toPOSIX<TBCPLocale extends BCP47Locale>(
  locale: TBCPLocale
): InferPosixFromBCP47Locale<TBCPLocale> {
  return locale.replace('-', '_') as InferPosixFromBCP47Locale<TBCPLocale>;
}

/**
 * Type guard to check if a value is a valid Locale.
 */
export function isLocale(value: string | undefined): value is Locale {
  if (!value) return false;

  return Locales.includes(value as Locale);
}

/**
 * Retrieves the human-readable name of a given locale.
 *
 * @param locale - The locale string (e.g., `"en_US"` or `"fr-FR"`).
 * @returns The human-readable name of the locale (e.g., `"English (United States)"` or `"French (France)"`).
 */
export function getLocaleName(locale: Locale): string {
  try {
    const [lang, region] = locale.split(/[_-]/); // support both en_US and en-US formats
    const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    const language: string | undefined = languageNames.of(lang);
    const regionName: string | undefined =
      region ? regionNames.of(region) : undefined;

    if (!language) {
      return locale;
    }
    return regionName ? `${language} (${regionName})` : language;
  } catch {
    return locale;
  }
}

/**
 * Extracts the country/region code from a given locale string.
 *
 * @param locale - The locale string (e.g., `"en_US"` or `"fr-FR"`).
 * @returns The `ISO 3166-1 alpha-2` country/region code (e.g., `"US"` or `"FR"`), or null if not found.
 */
export function getCountryFromLocale(locale: Locale): CountryCode | null {
  const parts = locale.split(/[_-]/);
  if (parts.length !== 2) return null;

  return parts[1] as CountryCode;
}

/**
 * Determines if a given locale corresponds to a right-to-left (RTL) language.
 *
 * @param language - The `ISO 639-1` language code to check.
 * @returns `true` if the locale is RTL, `false` otherwise.
 */
export function isRtlLanguage(language: ISO639_1LanguageCode | undefined) {
  return !!language && rtlLanguages.has(language);
}

/**
 * Determines if the given locale supports pluralization.
 *
 * @param {Locale} locale - The locale to check for pluralization support.
 * @return {boolean} `true` if the locale supports pluralization, `false` otherwise.
 */
export function supportsPluralization(locale: Locale): boolean {
  return !nonPluralLocales.has(locale);
}
