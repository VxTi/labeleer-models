import { describe, expect, it } from 'vitest';
import { getFormatForExtension, SupportedFormat } from './file-formats';

describe('getExtensionsForFormat', () => {
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
