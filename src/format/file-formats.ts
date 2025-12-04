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
export function getExtensionsForFormat(format: SupportedFormat): string[] {
  switch (format) {
    case SupportedFormat.JSON:
      return ['json'];
    case SupportedFormat.YAML:
      return ['yaml', 'yml'];
    case SupportedFormat.ANDROID_STRINGS:
      return ['xml'];
    case SupportedFormat.APPLE_STRINGS:
      return ['strings'];
    case SupportedFormat.XLIFF:
      return ['xliff', 'xlf', 'xml'];
    case SupportedFormat.PO:
      return ['po', 'pot'];
    case SupportedFormat.TS:
      return ['ts'];
  }
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
