import { type GetTextTranslation, po } from 'gettext-parser';
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

    Object.values(output.translations).forEach(context => {
      Object.entries(context).forEach(([key, entry]) => {
        if (!key) return; // skip empty header

        const plurals = extractPlurals(targetLocale, entry);

        if (plurals) {
          builder.addPluralEntry(key, plurals);
        } else {
          builder.addTranslation(key, {
            [targetLocale]: entry.msgstr?.[0] || '',
          });
        }

        builder
          .addDescription(key, entry.comments?.extracted)
          .addTags(key, entry.comments?.reference?.split('\n'));
      });
    });

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

function extractPlurals(
  targetLocale: Locale,
  entry: GetTextTranslation
): TranslationPluralization | undefined {
  const plurals: TranslationPluralization = {};

  if (!entry.msgid_plural || entry.msgstr.length <= 1) {
    return;
  }

  const msgPlurals = entry.msgstr.slice(
    0,
    Math.min(entry.msgstr.length, quantities.length)
  );

  msgPlurals.forEach((plural, index) => {
    if (plural.trim().length === 0) return;

    plurals[quantities[index]] = { [targetLocale]: plural };
  });

  return plurals;
}
