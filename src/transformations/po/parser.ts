import { po } from 'gettext-parser';
import { quantities } from '@/constants';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  AggregateParserFn,
  ParserFn,
  TranslationPluralization,
} from '@/definitions';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';

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
    const builder = new DatasetBuilder();

    for (const context of Object.values(output.translations)) {
      for (const [key, entry] of Object.entries(context)) {
        if (!key) continue; // skip header

        const translation = entry.msgstr?.[0] || '';
        const tags = entry.comments?.reference
          ? entry.comments.reference.split('\n')
          : undefined;

        builder
          .addDescription(key, entry.comments?.extracted)
          .addTags(key, tags)
          .addTranslation(key, {
            [targetLocale]: translation,
          });

        if (entry.msgid_plural && entry.msgstr?.length > 1) {
          const msgPlurals = entry.msgstr.slice(0, quantities.length);

          const plurals = Object.fromEntries(
            msgPlurals.map((msg, index) => [
              quantities[index],
              { [targetLocale]: msg },
            ])
          ) as TranslationPluralization;

          builder.addPluralEntry(key, plurals);
        }
      }
    }

    return Promise.resolve(builder.build());
  } catch (error) {
    throw new ParsingError(`Failed to parse PO input: ${String(error)}`, {
      cause: error as Error,
    });
  }
};

export const parsePoAggregated: AggregateParserFn = async (inputs, options) => {
  const builder = new DatasetBuilder();

  for (const [locale, content] of Object.entries(inputs)) {
    const dataset = await parsePo(content, {
      ...options,
      targetLocale: locale as Locale,
    });

    builder.merge(dataset);
  }

  return Promise.resolve(builder.build());
};
