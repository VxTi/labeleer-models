import { APPLE_STRING_LINE_REGEX } from './common';
import { DatasetBuilder } from '@/dataset-builder';
import type { AggregateParserFn, ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';

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

  for (const [locale, content] of Object.entries(inputs)) {
    const dataset = parseAppleStrings(content, {
      ...options,
      targetLocale: locale as Locale,
    });

    builder.merge(dataset);
  }

  return builder.build();
};
