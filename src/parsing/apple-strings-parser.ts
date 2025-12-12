import merge from 'lodash/merge';
import { ParsingError } from '../errors';
import type { Locale } from '../locales';
import type { AggregateParserFn, ParserFn, TranslationDataset } from '../types';

const APPLE_STRING_LINE_REGEX =
  /^\s*\uFEFF?"((?:[^"\\]|\\(?:U[0-9A-Fa-f]{4}|.))*)"\s*=\s*"((?:[^"\\]|\\(?:U[0-9A-Fa-f]{4}|.))*)"\s*;\s*$/;

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

  return dataset;
};

export const parseAppleStringsAggregated: AggregateParserFn = (
  inputs,
  options
) => {
  const dataset: TranslationDataset = {};

  for (const [locale, content] of Object.entries(inputs)) {
    const parsed = parseAppleStrings(content, {
      ...options,
      targetLocale: locale as Locale,
    });

    merge(dataset, parsed);
  }

  return dataset;
};
