import { describe, expect, it } from 'vitest';
import { isRtlLanguage } from './rtl-locales.js';

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
