/**
 * Enum representing the supported export formats for localization files.
 * Each format corresponds to a specific file type used in localization workflows.
 */
export enum LanguageFileFormat {
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
  LanguageFileFormat.XLIFF,
  LanguageFileFormat.APPLE_STRINGS,
  LanguageFileFormat.ANDROID_STRINGS,
  LanguageFileFormat.TS,
  LanguageFileFormat.PO,
] as const;

/**
 * Type representing formats that require compression.
 */
export type CompressedFormat = (typeof compressedFormats)[number];

/**
 * Type guard to check if a format requires compression.
 */
export function isCompressedFormat(
  format: LanguageFileFormat
): format is CompressedFormat {
  return compressedFormats.includes(format as CompressedFormat);
}
