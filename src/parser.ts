import { SupportedFormat } from './file-formats';
import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  TranslationDataset,
} from './types';
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
export async function parseDataset<
  TFormat extends SupportedFormat,
  TOptions extends ParsingOptions<
    InferParsingOptions<(typeof parserMap)[TFormat]>
  >,
>(
  dataset: string,
  fileFormat: TFormat,
  options: TOptions
): Promise<TranslationDataset> {
  return await parserMap[fileFormat](dataset, options);
}

type InferParsingOptions<T extends ParserFn | AggregateParserFn> =
  T extends ParserFn<infer U>
    ? U
    : T extends AggregateParserFn<infer U>
      ? U
      : never;

const parserMap: Record<SupportedFormat, ParserFn | AggregateParserFn> = {
  [SupportedFormat.JSON]: parseJson,
  [SupportedFormat.YAML]: parseYaml,
  [SupportedFormat.PO]: parsePo,
  [SupportedFormat.ANDROID_STRINGS]: parseAndroidStrings,
  [SupportedFormat.XLIFF]: parseXliff,
  [SupportedFormat.TS]: parseTs,
  [SupportedFormat.APPLE_STRINGS]: parseAppleStrings,
  [SupportedFormat.XCSTRINGS]: parseXcstrings,
} as const;
