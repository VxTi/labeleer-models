// POSIX locale codes supported by the application.
// Source: https://www.gnu.org/software/libc/manual/html_node/Locale-Names.html
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

export type Locale = (typeof Locales)[number];

export type BCP47Locale<T extends string> =
  T extends `${infer Lang}_${infer Region}` ? `${Lang}-${Region}` : never;

export type ISO639_1LanguageCode<T extends string> =
  T extends `${infer Lang}_${infer _Region}` ? Lang : never;

export interface NamedLocaleEntry {
  code: Locale;
  name: string;
}

export function isISO639_1LanguageCode(
  value: string | undefined
): value is ISO639_1LanguageCode<Locale> {
  if (!value) return false;

  const iso639_1Codes = Locales.map(loc => loc.split('_')[0]);
  return iso639_1Codes.includes(value);
}

export function toISO639_1LanguageCode<T extends Locale>(
  locale: T
): ISO639_1LanguageCode<T> {
  return locale.split('_')[0] as ISO639_1LanguageCode<T>;
}

export function iso639_1ToLocale(
  languageCode: ISO639_1LanguageCode<Locale>
): Locale | null {
  const matchingLocale = Locales.find(loc =>
    loc.startsWith(`${languageCode}_`)
  );
  return matchingLocale || null;
}

export function isBCP47Locale(
  value: string | undefined
): value is BCP47Locale<Locale> {
  if (!value) return false;

  const bcp47Locales = Locales.map(loc => loc.replace('_', '-'));
  return (bcp47Locales as readonly string[]).includes(value);
}

export function toBCP47<T extends Locale>(posixLocale: T): BCP47Locale<T> {
  return posixLocale.replace('_', '-') as BCP47Locale<T>;
}

export function toPOSIX<T extends BCP47Locale<Locale>>(locale: T): Locale {
  return locale.replace('-', '_') as Locale;
}

/**
 * Type guard to check if a value is a valid Locale.
 */
export function isLocale(value: string | undefined): value is Locale {
  if (!value) return false;

  return (Locales as readonly string[]).includes(value);
}

// Mapping to human-readable names.
// You can expand this automatically with `new Intl.DisplayNames`.
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

export function getCountryFromLocale(locale: Locale): string | null {
  const parts = locale.split(/[_-]/);
  return parts.length === 2 ? parts[1] : null;
}

export function getLanguageFromLocale(locale: string): string | undefined {
  return locale.split(/[_-]/)?.at(0);
}

/**
 * Determines if a given locale corresponds to a right-to-left (RTL) language.
 *
 * @param language - The ISO 639-1 language code to check.
 * @returns True if the locale is RTL, false otherwise.
 */
export function isRtlLanguage(language: string | undefined) {
  return !!language && rtlLanguages.has(language);
}
