import { describe, expect, it } from 'vitest';
import { isCompressedFormat, LanguageFileFormat } from './file-formats';

describe('isCompressedFormat', () => {
  it.each`
    format                                | compression
    ${LanguageFileFormat.JSON}            | ${false}
    ${LanguageFileFormat.YAML}            | ${false}
    ${LanguageFileFormat.TS}              | ${true}
    ${LanguageFileFormat.PO}              | ${true}
    ${LanguageFileFormat.ANDROID_STRINGS} | ${true}
    ${LanguageFileFormat.APPLE_STRINGS}   | ${true}
    ${LanguageFileFormat.XLIFF}           | ${true}
  `(
    'should return true for formats that require compression ($format = $compression)',
    ({ format, compression }) => {
      expect(isCompressedFormat(format)).toBe(compression);
    }
  );
});
