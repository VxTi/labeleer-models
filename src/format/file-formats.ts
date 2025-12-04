/**
 * Enum representing the supported export formats for localization files.
 * Each format corresponds to a specific file type used in localization workflows.
 */
export enum SupportedFormat {
  JSON = 'json',
  YAML = 'yaml',
  TS = 'ts',
  PO = 'po',
  ANDROID_STRINGS = 'android_strings',
  APPLE_STRINGS = 'apple_strings',
  XLIFF = 'xliff',
}

/**
 * Returns the file extensions associated with a given export format.
 *
 * This function maps each SupportedFormat to its common file extensions,
 * as some formats can have multiple valid extensions.
 */
export function getFormatForExtension(
  extension: string
): SupportedFormat | undefined {
  if (extension.endsWith('.json')) return SupportedFormat.JSON;

  if (extension.endsWith('.yaml') || extension.endsWith('.yml'))
    return SupportedFormat.YAML;

  if (extension.endsWith('.xml')) return SupportedFormat.XLIFF;

  if (extension.endsWith('.strings')) return SupportedFormat.APPLE_STRINGS;

  if (extension.endsWith('.xliff') || extension.endsWith('.xlf'))
    return SupportedFormat.XLIFF;

  if (extension.endsWith('.po') || extension.endsWith('.pot'))
    return SupportedFormat.PO;

  if (extension.endsWith('.ts')) return SupportedFormat.TS;

  return undefined;
}

/**
 * Returns the MIME type for a given export format.
 * For compressed formats, it returns 'application/zip'.
 */
export function mimeTypeForExportFormat(format: SupportedFormat): string {
  switch (format) {
    case SupportedFormat.JSON:
      return 'application/json';
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

/**
 * Formats that require compression when exporting multiple locale files.
 */
export const compressedFormats = [
  SupportedFormat.XLIFF,
  SupportedFormat.APPLE_STRINGS,
  SupportedFormat.ANDROID_STRINGS,
  SupportedFormat.TS,
  SupportedFormat.PO,
] as const;

/**
 * Type representing formats that require compression.
 */
export type CompressedFormat = (typeof compressedFormats)[number];

/**
 * Type guard to check if a format requires compression.
 */
export function requiresCompression(
  format: SupportedFormat
): format is CompressedFormat {
  return compressedFormats.includes(format as CompressedFormat);
}
