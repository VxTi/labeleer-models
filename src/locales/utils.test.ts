import { getCountryFromLocale, getLocaleName } from './utils';
import { type CountryCode, type Locale, Locales } from '@/locales/locales';
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
