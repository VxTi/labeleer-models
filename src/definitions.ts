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
export type ParsingOptions<TAdditionalOptions extends object> = {
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
} & Partial<TAdditionalOptions>;

/**
 * A function that takes a string input and an optional locale,
 * and returns a TranslationDataset or undefined if parsing fails.
 *
 * Whenever a {@link Locale} is provided, the parser should prioritize
 * parsing translations relevant to that locale.
 */
export type ParserFn<T extends object = {}> = (
  input: string,
  options: ParsingOptions<T>
) => TranslationDataset;

/**
 * A function that takes multiple string inputs mapped by identifiers,
 * along with optional parsing options,
 * and returns a single aggregated TranslationDataset.
 */
export type AggregateParserFn<T extends object = {}> = (
  inputs: Partial<Record<Locale, string>>,
  options: ParsingOptions<T>
) => TranslationDataset;

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

/**
 * A fragment of serialized output,
 * which can be useful for formats that require multiple files.
 */
export interface SerializationResult {
  /**
   * An optional identifier for the fragment,
   * useful for formats that require multiple files.
   *
   * This will make it easier to identify the fragment later on.
   */
  filename: string;

  /**
   * The serialized content of the fragment.
   */
  data: string;
}

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
