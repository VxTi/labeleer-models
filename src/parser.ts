import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  TranslationDataset,
} from './definitions';
import { LanguageFileFormat } from './file-formats';
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

export type FileFormat = 'json' | ''

export abstract class ILanguageFileTransformer<
  TFileFormat extends LanguageFileFormat,
> {
  public readonly fileFormat: TFileFormat;

  public constructor(fileFormat: TFileFormat) {
    this.fileFormat = fileFormat;
  }

  public abstract canParse(extension: string): boolean;

  public abstract parse(input: string): TranslationDataset;

  public abstract stringify(input: TranslationDataset): string;
}

export class ParserSetBuilder {
  private parsers: ILanguageFileTransformer<LanguageFileFormat>
}

export class ParserSet {}
