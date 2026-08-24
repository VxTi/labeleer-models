import type { Locale } from './locales';

/**
 * An entry in a translation dataset,
 * containing translations for multiple locales,
 * along with optional metadata such as tags and description.
 */
export type TranslationEntry<TPlural extends true | false = boolean> = {
  translations: TranslationLocalizedEntries;
  tags?: string[];
  description?: string;
} & (TPlural extends true ? { plurals: TranslationPluralization }
: { plurals?: undefined });

export enum Plurality {
  ZERO = 'zero',
  ONE = 'one',
  TWO = 'two',
  FEW = 'few',
  MANY = 'many',
  OTHER = 'other',
}

/**
 * Pluralization entries for different quantities,
 * each containing localized translations.
 */
export type TranslationPluralization = Partial<
  Record<Plurality, TranslationLocalizedEntries>
>;

export type TranslationLocalizedEntries = Partial<Record<Locale, string>>;

export type TranslationKey<T extends string> = T;

/**
 * A dataset of translation entries,
 * where each key is a unique identifier for a translation entry.
 */
export type TranslationDataset<TKey extends string = string> = Record<
  TranslationKey<TKey>,
  TranslationEntry
>;

/**
 * Extensible options for parsing functions
 */
export interface ParsingOptions {
  /**
   * The locale to prioritize when parsing translations.
   */
  referenceLocale: Locale;

  /**
   * An optional target locale for the parsing process.
   * This can be useful for formats that are specific to a single locale,
   * and/or that are missing locale information in their structure.
   */
  targetLocale?: Locale;
}

/**
 * Options for serialization functions
 */
export type SerializationOptions<TAdditionalOptions extends object = object> = {
  /**
   * The reference locale for the serialization process.
   * This is necessary for formats that require a base language,
   * e.g., Android Strings, Apple Strings or TS.
   */
  referenceLocale: Locale;

  /**
   * The list of locales to include in the serialization output.
   */
  locales: Locale[];
} & Partial<TAdditionalOptions>;

export interface SerializationFileFragment {
  filename: string;
  content: string;
}

export interface SerializationFile {
  isDirectory?: boolean;
  content: string;
}

/**
 * Serialization output, keyed by file name
 */
export type SerializationResult = {
  [filename: string]: SerializationFile;
};

/**
 * A function that takes a TranslationDataset and optional serialization options,
 * and returns an array of SerializationFragments, a single string, or undefined if serialization fails.
 *
 * A {@link SerializationResult} represents a part of the serialized output,
 * which can be useful for formats that require multiple files.
 */
export type SerializerFn<TAdditionalOptions extends object = object> = (
  dataset: TranslationDataset,
  options: SerializationOptions<TAdditionalOptions>
) => SerializationResult[];

export type MaybeArray<T> = Array<T> | T;

export type MakeOptional<T extends object, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
