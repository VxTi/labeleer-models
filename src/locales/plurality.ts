import { type ISO639_1LanguageCode, type Locale } from './locales';
import { toISO639_1LanguageCode } from './utils';

export enum Plurality {
  ZERO = 'zero',
  ONE = 'one',
  TWO = 'two',
  FEW = 'few',
  MANY = 'many',
  OTHER = 'other',
}

/**
 * Locales that have no grammatical plural distinction and therefore only
 * support {@link Plurality.OTHER}.
 */
export const nonPluralLocales = new Set<Locale>([
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

/**
 * Determines if the given locale supports pluralization.
 *
 * @param {Locale} locale - The locale to check for pluralization support.
 * @return {boolean} `true` if the locale supports pluralization, `false` otherwise.
 */
export function hasPluralization(locale: Locale): boolean {
  return !nonPluralLocales.has(locale);
}

/**
 * All plural forms, used as fallback for locales without known plural rules.
 */
const allPluralities: Plurality[] = Object.values(Plurality);

const ONE_OTHER = [
  Plurality.ONE,
  Plurality.OTHER,
] as const satisfies Plurality[];

const ONE_MANY_OTHER = [
  Plurality.ONE,
  Plurality.MANY,
  Plurality.OTHER,
] as const satisfies Plurality[];

const ONE_FEW_OTHER = [
  Plurality.ONE,
  Plurality.FEW,
  Plurality.OTHER,
] as const satisfies Plurality[];

const ONE_FEW_MANY_OTHER = [
  Plurality.ONE,
  Plurality.FEW,
  Plurality.MANY,
  Plurality.OTHER,
] as const satisfies Plurality[];

const ONE_TWO_FEW_MANY_OTHER = [
  Plurality.ONE,
  Plurality.TWO,
  Plurality.FEW,
  Plurality.MANY,
  Plurality.OTHER,
] as const satisfies Plurality[];

/**
 * `CLDR` cardinal plural categories per `ISO 639-1` language code.
 * Locales absent from this map are either non-pluralizing (see `nonPluralLocales`)
 * or fall back to all plural forms.
 *
 * @see [Unicode CLDR - Language Plural Rules](https://www.unicode.org/cldr/charts/47/supplemental/language_plural_rules.html)
 */
const pluralitiesByLanguage: Partial<
  Record<ISO639_1LanguageCode, Plurality[]>
> = {
  // African & Middle Eastern
  af: ONE_OTHER,
  am: ONE_OTHER,
  ar: allPluralities,
  ps: ONE_OTHER,
  sw: ONE_OTHER,
  xh: ONE_OTHER,
  zu: ONE_OTHER,

  // Caucasian & Central Asian
  hy: ONE_OTHER,
  ka: ONE_OTHER,
  ks: ONE_OTHER,

  // European - Baltic & Slavic
  be: ONE_FEW_MANY_OTHER,
  bg: ONE_OTHER,
  bs: ONE_FEW_OTHER,
  cs: ONE_FEW_MANY_OTHER,
  hr: ONE_FEW_OTHER,
  lt: ONE_FEW_MANY_OTHER,
  lv: [Plurality.ZERO, Plurality.ONE, Plurality.OTHER],
  mk: ONE_OTHER,
  pl: ONE_FEW_MANY_OTHER,
  ru: ONE_FEW_MANY_OTHER,
  sk: ONE_FEW_MANY_OTHER,
  sl: [Plurality.ONE, Plurality.TWO, Plurality.FEW, Plurality.OTHER],
  sq: ONE_OTHER,
  sr: ONE_FEW_OTHER,
  uk: ONE_FEW_MANY_OTHER,

  // European - Romance & Germanic
  ca: ONE_MANY_OTHER,
  cy: allPluralities,
  da: ONE_OTHER,
  de: ONE_OTHER,
  el: ONE_OTHER,
  et: ONE_OTHER,
  eu: ONE_OTHER,
  fi: ONE_OTHER,
  ga: ONE_TWO_FEW_MANY_OTHER,
  gl: ONE_OTHER,
  is: ONE_OTHER,
  it: ONE_MANY_OTHER,
  mt: ONE_TWO_FEW_MANY_OTHER,
  nl: ONE_OTHER,
  no: ONE_OTHER,
  nn: ONE_OTHER,
  ro: ONE_FEW_OTHER,
  sv: ONE_OTHER,
  en: ONE_OTHER,
  fr: ONE_MANY_OTHER,
  es: ONE_MANY_OTHER,
  pt: ONE_MANY_OTHER,

  // South Asian & Indo-Iranian
  bn: ONE_OTHER,
  dv: ONE_OTHER,
  gu: ONE_OTHER,
  he: [Plurality.ONE, Plurality.TWO, Plurality.OTHER],
  hi: ONE_OTHER,
  ku: ONE_OTHER,
  ml: ONE_OTHER,
  ne: ONE_OTHER,
  pa: ONE_OTHER,
  sd: ONE_OTHER,
  si: ONE_OTHER,
  ta: ONE_OTHER,
  te: ONE_OTHER,
  ur: ONE_OTHER,

  // East & Southeast Asian
  mn: ONE_OTHER,

  // Yiddish
  yi: ONE_OTHER,
};

/**
 * Determines which plural forms the given locale supports.
 *
 * Locales that do not pluralize only support {@link Plurality.OTHER}; locales
 * without known plural rules fall back to all plural forms.
 *
 * @param {Locale} locale - The locale to retrieve the supported plural forms for.
 * @return {Set<Plurality>} The set of plural forms supported by the locale.
 */
export function getSupportedPlurality(locale: Locale): Set<Plurality> {
  if (!hasPluralization(locale)) {
    return new Set([Plurality.OTHER]);
  }

  const language: ISO639_1LanguageCode = toISO639_1LanguageCode(locale);

  return new Set(pluralitiesByLanguage[language] ?? allPluralities);
}
