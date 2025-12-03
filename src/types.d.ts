import type { Locale } from './util/locales';

/**
 * An entry in a translation dataset,
 * containing translations for multiple locales,
 * along with optional metadata such as tags and description.
 */
export interface TranslationEntry {
  translations: Partial<Record<Locale, string>>;
  tags?: string[];
  description?: string;
}

/**
 * A dataset of translation entries,
 * where each key is a unique identifier for a translation entry.
 */
export type TranslationDataset = Record<string, TranslationEntry>;

/**
 * A function that takes a string input and an optional locale,
 * and returns a TranslationDataset or undefined if parsing fails.
 *
 * Whenever a {@link Locale} is provided, the parser should prioritize
 * parsing translations relevant to that locale.
 */
export type ParserFn = (input: string, locale?: Locale) => TranslationDataset;

/**
 * Options for serialization functions
 */
export interface SerializationOptions {
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
}
export interface SerializationFragment {
  identifier?: string;
  content: string;
}

/**
 * A function that takes a TranslationDataset and optional serialization options,
 * and returns an array of SerializationFragments, a single string, or undefined if serialization fails.
 *
 * A {@link SerializationFragment} represents a part of the serialized output,
 * which can be useful for formats that require multiple files.
 */
export type SerializerFn = (
  dataset: TranslationDataset,
  options: SerializationOptions
) => SerializationFragment[] | string | undefined;
