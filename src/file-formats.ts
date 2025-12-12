import { uniq } from 'lodash';

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
  XCSTRINGS = 'xcstrings',
}

/**
 * Returns the MIME type for a given export format.
 * For compressed formats, it returns 'application/zip'.
 */
export function mimeTypeForExportFormat(format: SupportedFormat): string {
  switch (format) {
    case SupportedFormat.JSON:
    case SupportedFormat.XCSTRINGS:
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

const formatExtensionRegistry: Record<SupportedFormat, string[]> = {
  [SupportedFormat.JSON]: ['.json'],
  [SupportedFormat.YAML]: ['.yaml', '.yml'],
  [SupportedFormat.TS]: ['.ts'],
  [SupportedFormat.PO]: ['.po', '.pot'],
  [SupportedFormat.ANDROID_STRINGS]: ['.xml'],
  [SupportedFormat.APPLE_STRINGS]: ['.strings'],
  [SupportedFormat.XLIFF]: ['.xliff', '.xlf'],
  [SupportedFormat.XCSTRINGS]: ['.xcstrings'],
};

/**
 * Returns the file extensions associated with a given export format.
 * @param format - The SupportedFormat for which to retrieve extensions.
 * @returns An array of file extensions corresponding to the format.
 */
export function getFileExtensionsFromFormat(format: SupportedFormat): string[] {
  return formatExtensionRegistry[format];
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
  return Object.entries(formatExtensionRegistry).find(([, extensions]) =>
    extensions.some(ext => extension.endsWith(ext))
  )?.[0] as SupportedFormat | undefined;
}

/**
 * Returns a list of all supported file extensions across all export formats.
 */
export function supportedFileExtensions(): string[] {
  return uniq(Object.values(formatExtensionRegistry).flat());
}
