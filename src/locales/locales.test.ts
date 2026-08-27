import {
  type CountryCode,
  getCountryFromLocale,
  getLocaleName,
  isRtlLanguage,
  supportsPluralization,
} from '@/locales/locales';
import { type Locale, Locales } from '@/locales/dataset';
import { describe, expect, it } from 'vitest';

describe('getLocaleName', () => {
  it.each(Locales)('should format %s correctly', locale => {
    expect(getLocaleName(locale)).toMatchSnapshot();
  });
});

describe('getCountryFromLocale', () => {
  it.each<[Locale, CountryCode]>([
    ['af_ZA', 'ZA'],
    ['am_ET', 'ET'],
    ['ar_SA', 'SA'],
    ['ps_AF', 'AF'],
    ['sw_KE', 'KE'],
    ['wo_SN', 'SN'],
    ['xh_ZA', 'ZA'],
    ['en_US', 'US'],
    ['en_GB', 'GB'],
    ['en_AU', 'AU'],
    ['en_CA', 'CA'],
    ['en_NZ', 'NZ'],
    ['en_IN', 'IN'],
    ['fr_FR', 'FR'],
    ['pt_PT', 'PT'],
    ['km_KH', 'KH'],
    ['zh_SG', 'SG'],
    ['tr_TR', 'TR'],
  ])(
    'should correctly extract country code %s to %s',
    (locale, countryCode) => {
      expect(getCountryFromLocale(locale)).toEqual(countryCode);
    }
  );
});

describe('isRtlLanguage', () => {
  it.each`
    language | expected
    ${'en'}  | ${false}
    ${'nl'}  | ${false}
    ${'ar'}  | ${true}
    ${'he'}  | ${true}
    ${'fa'}  | ${true}
    ${'ur'}  | ${true}
    ${'yi'}  | ${true}
    ${'ku'}  | ${true}
    ${'ps'}  | ${true}
    ${'sd'}  | ${true}
    ${'ug'}  | ${true}
    ${'dv'}  | ${true}
    ${'ks'}  | ${true}
  `(
    'should correctly result in $expected for language $language',
    ({ language, expected }) => {
      expect(isRtlLanguage(language)).toBe(expected);
    }
  );
});

describe('supportsPluralization', () => {
  it.each<[Locale, boolean]>([
    ['ja_JP', false],
    ['ko_KR', false],
    ['zh_CN', false],
    ['zh_TW', false],
    ['zh_HK', false],
    ['zh_SG', false],
    ['vi_VN', false],
    ['th_TH', false],
    ['km_KH', false],
    ['lo_LA', false],
    ['my_MM', false],
    ['id_ID', false],
    ['ms_MY', false],
    ['ms_BN', false],

    ['tr_TR', false],
    ['az_AZ', false],
    ['hu_HU', false],
    ['uz_UZ', false],
    ['kk_KZ', false],
    ['ug_CN', false],
    ['ky_KG', false],
    ['tk_TM', false],

    ['kn_IN', false],
    ['bo_CN', false],
    ['bo_IN', false],
    ['dz_BT', false],

    ['yo_NG', false],
    ['yo_BJ', false],
    ['wo_SN', false],
    ['su_ID', false],
    ['jv_ID', false],
    ['gug_PY', false],
    ['fa_IR', false],
    ['fa_AF', false],
    ['en_US', true],
    ['nl_NL', true],
  ])(
    'should correctly determine whether %s supports pluralization (%b)',
    (locale, supports) => {
      expect(supportsPluralization(locale)).toEqual(supports);
    }
  );
});
