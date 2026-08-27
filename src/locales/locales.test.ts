import { getLocaleName } from '@/locales/locales';
import { Locales } from '@/locales/posix-locales';
import { describe, expect, it } from 'vitest';

describe('getLocaleName', () => {
  it.each(Locales)('should format %s correctly', locale => {
    expect(getLocaleName(locale)).toMatchSnapshot();
  });
});
