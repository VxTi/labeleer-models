export const enum SupportedFormat {
  JSON = 'json',
  XML = 'xml',
  YAML = 'yaml',
  TS = 'ts',
  PO = 'po',
  CSV = 'csv',
  ANDROID_STRINGS = 'android_strings',
  APPLE_STRINGS = 'apple_strings',
  XLIFF = 'xliff',
}

/**
 * Returns the MIME type for a given export format.
 * For compressed formats, it returns 'application/zip'.
 */
export function mimeTypeForExportFormat(format: SupportedFormat): string {
  switch (format) {
    case SupportedFormat.JSON:
      return 'application/json';
    case SupportedFormat.CSV:
      return 'text/csv';
    case SupportedFormat.XML:
      return 'application/xml';
    case SupportedFormat.YAML:
      return 'application/yaml';
    case SupportedFormat.ANDROID_STRINGS:
    case SupportedFormat.APPLE_STRINGS:
    case SupportedFormat.XLIFF:
    case SupportedFormat.PO:
    case SupportedFormat.TS:
      return 'application/zip';
  }
}

export const compressedFormats = [
  SupportedFormat.XLIFF,
  SupportedFormat.APPLE_STRINGS,
  SupportedFormat.ANDROID_STRINGS,
  SupportedFormat.TS,
  SupportedFormat.PO,
] as const;

export type CompressedFormat = (typeof compressedFormats)[number];

export function requiresCompression(
  format: SupportedFormat
): format is CompressedFormat {
  return compressedFormats.includes(format as CompressedFormat);
}
