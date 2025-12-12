import { describe, expect, it } from 'vitest';
import {
  getFileExtensionsFromFormat,
  getFormatForExtension,
  mimeTypeForExportFormat,
  supportedFileExtensions,
  SupportedFormat,
} from './file-formats';

describe('getFormatForExtension', () => {
  it.each`
    extension   | format
    ${'.yaml'}  | ${SupportedFormat.YAML}
    ${'.yml'}   | ${SupportedFormat.YAML}
    ${'.xliff'} | ${SupportedFormat.XLIFF}
    ${'.xlf'}   | ${SupportedFormat.XLIFF}
    ${'.xml'}   | ${SupportedFormat.XLIFF}
    ${'.json'}  | ${SupportedFormat.JSON}
    ${'.po'}    | ${SupportedFormat.PO}
    ${'.pot'}   | ${SupportedFormat.PO}
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

describe('mimeTypeForExportFormat', () => {
  it.each`
    format                             | mimeType
    ${SupportedFormat.JSON}            | ${'application/json'}
    ${SupportedFormat.YAML}            | ${'application/yaml'}
    ${SupportedFormat.TS}              | ${'application/zip'}
    ${SupportedFormat.PO}              | ${'application/zip'}
    ${SupportedFormat.ANDROID_STRINGS} | ${'application/zip'}
    ${SupportedFormat.APPLE_STRINGS}   | ${'application/zip'}
    ${SupportedFormat.XLIFF}           | ${'application/zip'}
  `(
    'should return the correct MIME type for the provided format',
    ({ format, mimeType }) => {
      expect(mimeTypeForExportFormat(format)).toBe(mimeType);
    }
  );
});
