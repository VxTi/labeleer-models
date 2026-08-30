import { describe, expect, it } from 'vitest';
import { isCompressedFormat, FileFormat } from './file-formats.js';

describe('isCompressedFormat', () => {
  it.each`
    format                        | compression
    ${FileFormat.JSON}            | ${false}
    ${FileFormat.YAML}            | ${false}
    ${FileFormat.TS}              | ${true}
    ${FileFormat.PO}              | ${true}
    ${FileFormat.ANDROID_STRINGS} | ${true}
    ${FileFormat.APPLE_STRINGS}   | ${true}
    ${FileFormat.XLIFF}           | ${true}
  `(
    'should return true for formats that require compression ($format = $compression)',
    ({ format, compression }) => {
      expect(isCompressedFormat(format)).toBe(compression);
    }
  );
});
