import { po } from 'gettext-parser';
import merge from 'lodash/merge';
import type { Locale } from '../locales';
import { ParsingError } from '../processing';
import type { AggregateParserFn, ParserFn, TranslationDataset } from '../types';

/**
 * Parses a PO file input into a TranslationDataset.
 *
 * @param input - The PO file content as a string.
 * @param options - Parsing options including the target locale.
 * @returns A TranslationDataset representing the parsed translations.
 * @throws {ParsingError} If parsing fails or if the target locale is not provided.
 */
export const parsePo: ParserFn = (input, { targetLocale }) => {
  if (!targetLocale) {
    throw new ParsingError('Target locale is required for parsing PO files.');
  }
  try {
    const output = po.parse(input);
    const dataset: TranslationDataset = {};

    for (const context of Object.values(output.translations)) {
      for (const [msgid, entry] of Object.entries(context)) {
        if (!msgid) continue; // skip header

        const translation = entry.msgstr?.[0] || '';
        const tags = entry.comments?.reference
          ? entry.comments.reference.split('\n')
          : undefined;

        dataset[msgid] = {
          translations: { [targetLocale]: translation },
          ...(entry.msgid_plural && entry.msgstr?.length > 1
            ? { plurals: { [targetLocale]: entry.msgid_plural } }
            : {}),
          tags,
          description: entry.comments?.extracted || undefined,
        };
      }
    }

    return dataset;
  } catch (error) {
    throw new ParsingError(`Failed to parse PO input: ${String(error)}`, {
      cause: error as Error,
    });
  }
};

export const parsePoAggregated: AggregateParserFn = (inputs, options) => {
  const aggregatedDataset: TranslationDataset = {};

  for (const [locale, content] of Object.entries(inputs)) {
    const dataset = parsePo(content, {
      ...options,
      targetLocale: locale as Locale,
    });

    merge(aggregatedDataset, dataset);
  }

  return aggregatedDataset;
};
