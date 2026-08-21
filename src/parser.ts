import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  TranslationDataset,
} from './definitions';
import { LanguageFileFormat } from './file-formats';
import { type ParserSet, ParserSetBuilder } from './transformer';
import {
  AndroidStringsDatasetTransformer,
  AppleStringsDatasetTransformer,
  JsonDatasetTransformer,
  PoDatasetTransformer,
  TsDatasetTransformer,
  XCStringsDatasetTransformer,
  XLIFFDatasetTransformer,
  YamlDatasetTransformer,
  parseAndroidStrings,
  parseAppleStrings,
  parseJson,
  parseYaml,
  parsePo,
  parseTs,
  parseXcstrings,
  parseXliff,
} from '@/transformations';

/**
 * Parses a dataset string based on the specified file format and options.
 *
 * @param dataset - The dataset string to be parsed.
 * @param fileFormat - The format of the dataset (e.g., JSON, YAML, PO).
 * @param options - Parsing options including referenceLocale and targetLocale.
 * @returns The parsed TranslationDataset.
 */
export function parseDataset<TFormat extends LanguageFileFormat>(
  dataset: string,
  fileFormat: TFormat,
  options: InferParsingOptions<TFormat>
): TranslationDataset {
  return parserMap[fileFormat](dataset, options);
}

type InferParsingOptions<TFormat extends LanguageFileFormat> =
  (typeof parserMap)[TFormat] extends ParserFn<infer TInferredOptions> ?
    ParsingOptions<TInferredOptions>
  : TFormat extends AggregateParserFn<infer TInferredOptions> ?
    ParsingOptions<TInferredOptions>
  : never;

const parserMap = {
  [LanguageFileFormat.JSON]: parseJson,
  [LanguageFileFormat.YAML]: parseYaml,
  [LanguageFileFormat.PO]: parsePo,
  [LanguageFileFormat.ANDROID_STRINGS]: parseAndroidStrings,
  [LanguageFileFormat.XLIFF]: parseXliff,
  [LanguageFileFormat.TS]: parseTs,
  [LanguageFileFormat.APPLE_STRINGS]: parseAppleStrings,
  [LanguageFileFormat.XCSTRINGS]: parseXcstrings,
} as const;

/**
 * Builds a {@link ParserSet} containing a transformer for every supported
 * {@link LanguageFileFormat}.
 *
 * Each call returns a fresh, independent set — mutate or extend it via a
 * {@link ParserSetBuilder} without affecting other consumers.
 */
export function createDefaultParserSet(): ParserSet {
  return new ParserSetBuilder()
    .addAll([
      new JsonDatasetTransformer(),
      new YamlDatasetTransformer(),
      new TsDatasetTransformer(),
      new PoDatasetTransformer(),
      new AndroidStringsDatasetTransformer(),
      new AppleStringsDatasetTransformer(),
      new XLIFFDatasetTransformer(),
      new XCStringsDatasetTransformer(),
    ])
    .build();
}

/**
 * A shared, ready-to-use {@link ParserSet} covering every supported format.
 */
export const defaultParserSet: ParserSet = createDefaultParserSet();
