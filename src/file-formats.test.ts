import { describe, expect, it } from 'vitest';
import {
  getFileExtensionsFromFormat,
  getFormatForExtension,
  isCompressedFormat,
  supportedFileExtensions,
  SupportedFormat,
} from './file-formats';

describe('getFormatForExtension', () => {
  it.each`
    extension       | format
    ${'.yaml'}      | ${SupportedFormat.YAML}
    ${'.yml'}       | ${SupportedFormat.YAML}
    ${'.xliff'}     | ${SupportedFormat.XLIFF}
    ${'.xlf'}       | ${SupportedFormat.XLIFF}
    ${'.xml'}       | ${SupportedFormat.ANDROID_STRINGS}
    ${'.json'}      | ${SupportedFormat.JSON}
    ${'.po'}        | ${SupportedFormat.PO}
    ${'.pot'}       | ${SupportedFormat.PO}
    ${'.xcstrings'} | ${SupportedFormat.XCSTRINGS}
  `(
    'should return the correct file format for the provided',
    ({ extension, format }) => {
      const fmt = getFormatForExtension(extension);
      expect(fmt).toEqual(format);
    }
  );
});

describe('supportedFileExtensions', () => {
  it('should return all supported file extensions', () => {
    expect(supportedFileExtensions()).toEqual([
      '.json',
      '.yaml',
      '.yml',
      '.ts',
      '.po',
      '.pot',
      '.xml',
      '.strings',
      '.xliff',
      '.xlf',
      '.xcstrings',
    ]);
  });
});

describe('getFileExtensionsFromFormat', () => {
  it.each`
    extension   | format
    ${'.yaml'}  | ${SupportedFormat.YAML}
    ${'.yml'}   | ${SupportedFormat.YAML}
    ${'.xliff'} | ${SupportedFormat.XLIFF}
    ${'.xlf'}   | ${SupportedFormat.XLIFF}
    ${'.xml'}   | ${SupportedFormat.ANDROID_STRINGS}
    ${'.json'}  | ${SupportedFormat.JSON}
    ${'.po'}    | ${SupportedFormat.PO}
    ${'.pot'}   | ${SupportedFormat.PO}
  `(
    'should return the correct file extensions for the provided format',
    ({ extension, format }) => {
      const extensions = getFileExtensionsFromFormat(format);
      expect(extensions).toContain(extension);
    }
  );
});

describe('isCompressedFormat', () => {
  it.each`
    format                             | compression
    ${SupportedFormat.JSON}            | ${false}
    ${SupportedFormat.YAML}            | ${false}
    ${SupportedFormat.TS}              | ${true}
    ${SupportedFormat.PO}              | ${true}
    ${SupportedFormat.ANDROID_STRINGS} | ${true}
    ${SupportedFormat.APPLE_STRINGS}   | ${true}
    ${SupportedFormat.XLIFF}           | ${true}
  `(
    'should return true for formats that require compression ($format = $compression)',
    ({ format, compression }) => {
      expect(isCompressedFormat(format)).toBe(compression);
    }
  );
});
