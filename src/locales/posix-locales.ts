/**
 * Supported POSIX locale codes
 * @see [GNU - Locale names](https://www.gnu.org/software/libc/manual/html_node/Locale-Names.html)
 */
export const Locales = [
  // African & Middle Eastern
  'af_ZA', // Afrikaans
  'am_ET', // Amharic
  'ar_SA', // Arabic
  'ps_AF', // Pashto
  'sw_KE', // Swahili
  'wo_SN', // Wolof
  'xh_ZA', // Xhosa
  'yo_NG', // Yoruba
  'yo_BJ', // Yoruba (Benin)
  'zu_ZA', // Zulu

  // Caucasian & Central Asian
  'az_AZ', // Azerbaijani
  'hy_AM', // Armenian
  'ka_GE', // Georgian
  'kk_KZ', // Kazakh
  'ky_KG', // Kyrgyz
  'tk_TM', // Turkmen
  'ug_CN', // Uyghur
  'uz_UZ', // Uzbek

  // Kashmiri variants
  'ks_IN', // Kashmiri (India - Arabic script / RTL)
  'ks_PK', // Kashmiri (Pakistan - Arabic script / RTL)

  // European - Baltic & Slavic
  'be_BY', // Belarusian
  'bg_BG', // Bulgarian
  'bs_BA', // Bosnian
  'cs_CZ', // Czech
  'hr_HR', // Croatian
  'lt_LT', // Lithuanian
  'lv_LV', // Latvian
  'mk_MK', // Macedonian
  'pl_PL', // Polish
  'ru_RU', // Russian
  'sk_SK', // Slovak
  'sl_SI', // Slovenian
  'sq_AL', // Albanian
  'sr_RS', // Serbian
  'sr_BA', // Serbian (Bosnia)
  'sr_ME', // Serbian (Montenegro)
  'uk_UA', // Ukrainian

  // European - Romance & Germanic
  'ca_ES', // Catalan
  'cy_GB', // Welsh
  'da_DK', // Danish
  'de_DE', // German
  'el_GR', // Greek
  'et_EE', // Estonian
  'eu_ES', // Basque
  'fi_FI', // Finnish
  'ga_IE', // Irish
  'gl_ES', // Galician
  'hu_HU', // Hungarian
  'is_IS', // Icelandic
  'it_IT', // Italian
  'mt_MT', // Maltese
  'nl_NL', // Dutch
  'nl_BE', // Flemish
  'no_NO', // Norwegian (Bokmål)
  'nn_NO', // Norwegian (Nynorsk)
  'ro_RO', // Romanian
  'sv_SE', // Swedish

  // English variants
  'en_US',
  'en_GB',
  'en_AU',
  'en_CA',
  'en_NZ',
  'en_IN',

  // French variants
  'fr_FR',
  'fr_CA',
  'fr_BE',
  'fr_CH',

  // Spanish variants
  'es_ES',
  'es_MX',
  'es_AR',
  'es_CO',
  'es_CL',
  'es_US',

  // Portuguese variants
  'pt_PT',
  'pt_BR',

  // South Asian & Indo-Iranian
  'bn_BD', // Bengali
  'dv_MV', // Dhivehi
  'fa_IR', // Persian (Iran)
  'fa_AF', // Persian/Dari (Afghanistan)
  'gu_IN', // Gujarati
  'he_IL', // Hebrew
  'hi_IN', // Hindi
  'kn_IN', // Kannada
  'ku_TR', // Kurdish (Turkey)
  'ku_IR', // Kurdish (Iran)
  'ku_IQ', // Kurdish (Iraq)
  'ku_SY', // Kurdish (Syria)
  'ml_IN', // Malayalam
  'ne_NP', // Nepali
  'pa_IN', // Punjabi
  'sd_IN', // Sindhi (India)
  'sd_PK', // Sindhi (Pakistan)
  'si_LK', // Sinhala
  'ta_IN', // Tamil
  'te_IN', // Telugu
  'ur_PK', // Urdu (Pakistan)
  'ur_IN', // Urdu (India)

  // East & Southeast Asian
  'bo_CN', // Tibetan (China)
  'bo_IN', // Tibetan (India)
  'dz_BT', // Dzongkha
  'id_ID', // Indonesian
  'ja_JP', // Japanese
  'jv_ID', // Javanese
  'km_KH', // Khmer
  'ko_KR', // Korean
  'lo_LA', // Lao
  'mn_MN', // Mongolian
  'ms_MY', // Malay (Malaysia)
  'ms_BN', // Malay (Brunei)
  'my_MM', // Burmese
  'su_ID', // Sundanese
  'th_TH', // Thai
  'vi_VN', // Vietnamese
  'zh_CN', // Chinese (Simplified)
  'zh_TW', // Chinese (Traditional, Taiwan)
  'zh_HK', // Chinese (Traditional, HK)
  'zh_SG', // Chinese (Simplified, Singapore)

  // Americas & Indigenous
  'gug_PY', // Guaraní

  // Yiddish variants
  'yi_US',
  'yi_IL',
  'yi_DE',
  'tr_TR', // Turkish
] as const;

/**
 * @see [POSIX Locale](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap07.html)
 */
export type Locale = (typeof Locales)[number];
