/**
 * Supported POSIX locale codes
 * @see [GNU - Locale names](https://www.gnu.org/software/libc/manual/html_node/Locale-Names.html)
 */
export const Locales = [
  'af_ZA', // Afrikaans
  'am_ET', // Amharic
  'ar_SA', // Arabic
  'az_AZ', // Azerbaijani
  'be_BY', // Belarusian
  'bg_BG', // Bulgarian
  'bn_BD', // Bengali
  'bs_BA', // Bosnian
  'ca_ES', // Catalan
  'cs_CZ', // Czech
  'cy_GB', // Welsh
  'da_DK', // Danish
  'de_DE', // German
  'el_GR', // Greek

  // English variants
  'en_GB',
  'en_US',
  'en_AU',
  'en_CA',
  'en_NZ',
  'en_IN',

  // French variants
  'fr_CA',
  'fr_BE',
  'fr_CH',

  // Portuguese variants
  'pt_BR',

  // Chinese variants
  'zh_HK',

  // Norwegian variant
  'nn_NO',

  // Serbian variants
  'sr_BA',
  'sr_ME',

  // Malay-Indonesian variants
  'id_ID',
  'ms_BN',
  // Spanish variants
  'es_MX',
  'es_AR',
  'es_CO',
  'es_CL',
  'es_US',
  'es_ES', // Spanish
  'et_EE', // Estonian
  'eu_ES', // Basque
  'fa_IR', // Persian (Farsi)
  'fi_FI', // Finnish
  'fr_FR', // French
  'nl_BE', // Flemish
  'ga_IE', // Irish
  'gl_ES', // Galician
  'gu_IN', // Gujarati
  'he_IL', // Hebrew
  'hi_IN', // Hindi
  'hr_HR', // Croatian
  'hu_HU', // Hungarian
  'hy_AM', // Armenian
  'is_IS', // Icelandic
  'it_IT', // Italian
  'ja_JP', // Japanese
  'ka_GE', // Georgian
  'kk_KZ', // Kazakh
  'km_KH', // Khmer
  'kn_IN', // Kannada
  'ko_KR', // Korean
  'ky_KG', // Kyrgyz
  'lo_LA', // Lao
  'lt_LT', // Lithuanian
  'lv_LV', // Latvian
  'mk_MK', // Macedonian
  'ml_IN', // Malayalam
  'mn_MN', // Mongolian
  'ms_MY', // Malay
  'mt_MT', // Maltese
  'my_MM', // Burmese
  'ne_NP', // Nepali
  'nl_NL', // Dutch
  'no_NO', // Norwegian
  'pa_IN', // Punjabi
  'pl_PL', // Polish
  'ps_AF', // Pashto
  'pt_PT', // Portuguese
  'ro_RO', // Romanian
  'ru_RU', // Russian
  'si_LK', // Sinhala
  'sk_SK', // Slovak
  'sl_SI', // Slovenian
  'sq_AL', // Albanian
  'sr_RS', // Serbian
  'sv_SE', // Swedish
  'sw_KE', // Swahili
  'ta_IN', // Tamil
  'te_IN', // Telugu
  'th_TH', // Thai
  'tr_TR', // Turkish
  'uk_UA', // Ukrainian
  'ur_PK', // Urdu
  'uz_UZ', // Uzbek
  'vi_VN', // Vietnamese
  'xh_ZA', // Xhosa
  'yo_NG', // Yoruba
  'zh_CN', // Chinese (Simplified)
  'zh_TW', // Chinese (Traditional)
  'zu_ZA', // Zulu
] as const;

/**
 * Set of language codes that are written in right-to-left (RTL) scripts.
 *
 * This set includes ISO 639-1 codes for languages such as Arabic, Hebrew, Persian, Urdu, and others.
 */
const rtlLanguages = new Set([
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'yi', // Yiddish
  'ji', // Yiddish (alternative code)
  'iw', // Hebrew (deprecated code, but still used)
  'ku', // Kurdish
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uyghur
  'dv', // Dhivehi/Maldivian
  'ks', // Kashmiri
]);

export type InferBCP47Locale<T extends string> =
  T extends `${infer Lang}_${infer Region}` ? `${Lang}-${Region}` : never;
export type InferISO639_1LanguageCode<T extends string> =
  T extends `${infer Lang}_${infer _Region}` ? Lang : never;

export type Locale = (typeof Locales)[number];
export type BCP47Locale = InferBCP47Locale<Locale>;
export type ISO639_1LanguageCode = InferISO639_1LanguageCode<Locale>;

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
export function iso639_1ToLocale(
  languageCode: ISO639_1LanguageCode
): Locale | null {
  const matchingLocale = Locales.find(loc =>
    loc.startsWith(`${languageCode}_`)
  );
  return matchingLocale || null;
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
export function toBCP47(posixLocale: Locale): BCP47Locale {
  return posixLocale.replace('_', '-') as BCP47Locale;
}

/**
 * Converts a `BCP 47` (Best Common Practice for Language Tags, e.g., `"en-US"`)
 * locale string to POSIX format (used in Unix-like systems, e.g., `"en_US"`).
 *
 * @param locale - The `BCP 47` locale string (e.g., `"en-US"`).
 * @returns The `POSIX` locale string (e.g., `"en_US"`).
 */
export function toPOSIX<T extends BCP47Locale>(locale: T): Locale {
  return locale.replace('-', '_') as Locale;
}

/**
 * Type guard to check if a value is a valid Locale.
 */
export function isLocale(value: string | undefined): value is Locale {
  if (!value) return false;

  return (Locales as readonly string[]).includes(value);
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
    const regionName: string | undefined = region
      ? regionNames.of(region)
      : undefined;

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
export function getCountryFromLocale(locale: Locale): string | null {
  const parts = locale.split(/[_-]/);
  return parts.length === 2 ? parts[1] : null;
}

/**
 * Extracts the language code from a given locale string.
 *
 * @param locale - The locale string (e.g., `"en_US"` or `"fr-FR"`).
 * @returns The `ISO 639-1` language code (e.g., `"en"` or `"fr"`), or `undefined` if not found.
 */
export function getLanguageFromLocale(locale: string): string | undefined {
  return locale.split(/[_-]/)?.at(0);
}

/**
 * Determines if a given locale corresponds to a right-to-left (RTL) language.
 *
 * @param language - The `ISO 639-1` language code to check.
 * @returns `true` if the locale is RTL, `false` otherwise.
 */
export function isRtlLanguage(language: string | undefined) {
  return !!language && rtlLanguages.has(language);
}
