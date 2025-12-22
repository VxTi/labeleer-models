import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  TranslationDataset,
} from './definitions';
import { SupportedFormat } from './file-formats';
import {
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
export async function parseDataset<TFormat extends SupportedFormat>(
  dataset: string,
  fileFormat: TFormat,
  options: InferParsingOptions<TFormat>
): Promise<TranslationDataset> {
  return await parserMap[fileFormat](dataset, options);
}

type InferParsingOptions<TFormat extends SupportedFormat> =
  (typeof parserMap)[TFormat] extends ParserFn<infer TInferredOptions> ?
    ParsingOptions<TInferredOptions>
  : TFormat extends AggregateParserFn<infer TInferredOptions> ?
    ParsingOptions<TInferredOptions>
  : never;

const parserMap = {
  [SupportedFormat.JSON]: parseJson,
  [SupportedFormat.YAML]: parseYaml,
  [SupportedFormat.PO]: parsePo,
  [SupportedFormat.ANDROID_STRINGS]: parseAndroidStrings,
  [SupportedFormat.XLIFF]: parseXliff,
  [SupportedFormat.TS]: parseTs,
  [SupportedFormat.APPLE_STRINGS]: parseAppleStrings,
  [SupportedFormat.XCSTRINGS]: parseXcstrings,
} as const;
