import merge from 'lodash/merge';
import { APPLE_STRING_LINE_REGEX } from './models';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';
import type { AggregateParserFn, ParserFn, TranslationDataset } from '@/types';

export const parseAppleStrings: ParserFn = (input, { targetLocale }) => {
  if (!targetLocale) {
    throw new ParsingError(
      'Locale is required for parsing Apple .strings files.'
    );
  }

  const lines = input.split('\n');
  const dataset: TranslationDataset = {};

  for (const line of lines) {
    const match = line.match(APPLE_STRING_LINE_REGEX);

    if (!match) continue;

    const [, key, value] = match;

    dataset[key] = {
      translations: {
        [targetLocale]: value,
      },
    };
  }

  return Promise.resolve(dataset);
};

export const parseAppleStringsAggregated: AggregateParserFn = async (
  inputs,
  options
) => {
  const dataset: TranslationDataset = {};

  for (const [locale, content] of Object.entries(inputs)) {
    const parsed = await parseAppleStrings(content, {
      ...options,
      targetLocale: locale as Locale,
    });

    merge(dataset, parsed);
  }

  return Promise.resolve(dataset);
};
