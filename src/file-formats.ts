import { entries } from '@/util/data-extraction';
import uniq from 'lodash-es/uniq';

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

const formatExtensionRegistry: Record<
  LanguageFileFormat,
  [string, ...string[]]
> = {
  [LanguageFileFormat.JSON]: ['.json'],
  [LanguageFileFormat.YAML]: ['.yaml', '.yml'],
  [LanguageFileFormat.TS]: ['.ts'],
  [LanguageFileFormat.PO]: ['.po', '.pot'],
  [LanguageFileFormat.ANDROID_STRINGS]: ['.xml'],
  [LanguageFileFormat.APPLE_STRINGS]: ['.strings'],
  [LanguageFileFormat.XLIFF]: ['.xliff', '.xlf'],
  [LanguageFileFormat.XCSTRINGS]: ['.xcstrings'],
};

/**
 * Returns the file extensions associated with a given export format.
 * @param format - The SupportedFormat for which to retrieve extensions.
 * @returns An array of file extensions corresponding to the format.
 */
export function getFileExtensionsFromFormat(
  format: LanguageFileFormat
): string[] {
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
): LanguageFileFormat | undefined {
  return entries(formatExtensionRegistry).find(([, extensions]) =>
    extensions.some(ext => extension.endsWith(ext))
  )?.[0];
}

/**
 * Returns a list of all supported file extensions across all export formats.
 */
export function supportedFileExtensions(): string[] {
  return uniq(Object.values(formatExtensionRegistry).flat());
}
