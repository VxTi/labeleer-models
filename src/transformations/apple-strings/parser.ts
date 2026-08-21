import { entries } from '@/util/data-extraction';
import { APPLE_STRING_LINE_REGEX } from './common';
import { serializeAppleStrings } from './serializer';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import type { Locale } from '@/locales';
import { ILanguageFileTransformer } from '@/transformer';

export const parseAppleStrings: ParserFn = (input, { targetLocale }) => {
  if (!targetLocale) {
    throw new ParsingError(
      'Locale is required for parsing Apple .strings files.'
    );
  }

  const lines = input.split('\n');
  const builder = new DatasetBuilder();

  for (const line of lines) {
    const match = line.match(APPLE_STRING_LINE_REGEX);

    if (!match) continue;

    const [, key, value] = match;

    builder.addTranslation(key, {
      [targetLocale]: value,
    });
  }

  return builder.build();
};

export const parseAppleStringsAggregated: AggregateParserFn = (
  inputs,
  options
) => {
  const builder = new DatasetBuilder();

  for (const [targetLocale, content] of entries(inputs)) {
    const dataset = parseAppleStrings(content, {
      ...options,
      targetLocale,
    });

    builder.merge(dataset);
  }

  return builder.build();
};

export class AppleStringsDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.APPLE_STRINGS> {
  public constructor() {
    super(LanguageFileFormat.APPLE_STRINGS);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseAppleStrings(input, options);
  }

  /**
   * Apple `.strings` files are single-locale, keyed off
   * {@link ParsingOptions.targetLocale}, so each aggregated input is parsed
   * against its own locale.
   */
  public override parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseAppleStringsAggregated(inputs, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeAppleStrings(dataset, options);
  }
}
