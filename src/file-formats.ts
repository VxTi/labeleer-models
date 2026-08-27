/**
 * Enum representing the supported export formats for localization files.
 * Each format corresponds to a specific file type used in localization workflows.
 */
export enum FileFormat {
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
 * Formats that require compression when exporting multiple locale files.
 */
export const compressedFormats = [
  FileFormat.XLIFF,
  FileFormat.APPLE_STRINGS,
  FileFormat.ANDROID_STRINGS,
  FileFormat.TS,
  FileFormat.PO,
] as const;

/**
 * Type representing formats that require compression.
 */
export type CompressedFormat = (typeof compressedFormats)[number];

/**
 * Type guard to check if a format requires compression.
 */
export function isCompressedFormat(
  format: FileFormat
): format is CompressedFormat {
  return compressedFormats.includes(format as CompressedFormat);
}
