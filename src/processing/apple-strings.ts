import type { ParserFn, SerializerFn, TranslationDataset } from '../types';
import { ParsingError } from './processing-errors';

const APPLE_STRING_LINE_REGEX =
  /^\s*"((?:[^"\\]|\\.)*)"\s*=\s*"((?:[^"\\]|\\.)*)";\s*$/;

export interface AppleStringsSerializationOptions {
  /**
   * Determines whether the
   */
  translateDirect: boolean;
}

export const serializeAppleStrings: SerializerFn = (input, options) => {

};

export const parseAppleStrings: ParserFn = (input, locale) => {
  if (!locale) {
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

    if (!dataset[key]) {
      dataset[key] = {
        translations: {
          [locale]: value,
        },
      };
    }
  }

  return dataset;
};
