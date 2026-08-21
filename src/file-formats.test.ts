import { describe, expect, it } from 'vitest';
import {
  getFileExtensionsFromFormat,
  getFormatForExtension,
  isCompressedFormat,
  supportedFileExtensions,
  LanguageFileFormat,
} from './file-formats';

describe('getFormatForExtension', () => {
  it.each`
    extension       | format
    ${'.yaml'}      | ${LanguageFileFormat.YAML}
    ${'.yml'}       | ${LanguageFileFormat.YAML}
    ${'.xliff'}     | ${LanguageFileFormat.XLIFF}
    ${'.xlf'}       | ${LanguageFileFormat.XLIFF}
    ${'.xml'}       | ${LanguageFileFormat.ANDROID_STRINGS}
    ${'.json'}      | ${LanguageFileFormat.JSON}
    ${'.po'}        | ${LanguageFileFormat.PO}
    ${'.pot'}       | ${LanguageFileFormat.PO}
    ${'.xcstrings'} | ${LanguageFileFormat.XCSTRINGS}
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
    ${'.yaml'}  | ${LanguageFileFormat.YAML}
    ${'.yml'}   | ${LanguageFileFormat.YAML}
    ${'.xliff'} | ${LanguageFileFormat.XLIFF}
    ${'.xlf'}   | ${LanguageFileFormat.XLIFF}
    ${'.xml'}   | ${LanguageFileFormat.ANDROID_STRINGS}
    ${'.json'}  | ${LanguageFileFormat.JSON}
    ${'.po'}    | ${LanguageFileFormat.PO}
    ${'.pot'}   | ${LanguageFileFormat.PO}
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
