import merge from 'lodash/merge';
import type {
  AggregateParserFn,
  ParserFn,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../types';
import type { Locale } from '../util/locales';
import { ParsingError } from './processing-errors';

const APPLE_STRING_LINE_REGEX =
  /^\s*\uFEFF?"((?:[^"\\]|\\(?:U[0-9A-Fa-f]{4}|.))*)"\s*=\s*"((?:[^"\\]|\\(?:U[0-9A-Fa-f]{4}|.))*)"\s*;\s*$/;

export interface AppleStringsSerializationOptions {
  /**
   * Determines whether the
   */
  translateDirect: boolean;
}

export const serializeAppleStrings: SerializerFn<
  AppleStringsSerializationOptions
> = (input, options) => {
  return options.locales.map(loc =>
    constructAppleStringsSerializationFragment(
      input,
      options.referenceLocale,
      loc,
      options.translateDirect
    )
  );
};

function constructAppleStringsSerializationFragment(
  dataset: TranslationDataset,
  referenceLocale: Locale,
  targetLocale: Locale,
  direct: boolean = false
): SerializationFragment {
  const kvMapping: Record<string, string> = {};

  for (const [key, entry] of Object.entries(dataset)) {
    const translated = entry.translations[targetLocale] ?? '';

    if (direct) {
      const refTranslation = entry.translations[referenceLocale];
      if (!refTranslation) continue; // Rather not have this happen...

      kvMapping[refTranslation] = translated;
    } else {
      kvMapping[key] = translated;
    }
  }

  const content = Object.entries(kvMapping)
    .map(([key, value]) => `"${escapeText(key)}" = "${escapeText(value)}";`)
    .join('\n');

  return {
    content,
    identifier: targetLocale,
  };
}

function escapeText(input: string): string {
  return input.replace(/"/g, '\\"');
}

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
