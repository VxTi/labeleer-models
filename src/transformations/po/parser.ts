import { type GetTextTranslation, po } from 'gettext-parser';
import { serializePo } from './serializer';
import { DatasetBuilder } from '@/dataset-builder';
import {
  type AggregateParserFn,
  type ParserFn,
  type ParsingOptions,
  Plurality,
  type SerializationOptions,
  type SerializationResult,
  type TranslationDataset,
  type TranslationPluralization,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import type { Locale } from '@/locales';
import { ILanguageFileTransformer } from '@/transformer';
import { entries } from '@/util/data-extraction';

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
      entries(context).forEach(([key, entry]) => {
        if (!key) return; // skip empty header

        const plurals = extractPlurals(targetLocale, entry);

        if (plurals) {
          builder.addPluralEntry(key, plurals);
        } else {
          builder.addTranslation(key, {
            [targetLocale]: entry.msgstr[0] || '',
          });
        }

        builder
          .addDescription(key, entry.comments?.extracted)
          .addTags(key, entry.comments?.reference?.split('\n'));
      });
    });

    return builder.build();
  } catch (error) {
    throw new ParsingError(`Failed to parse PO input: ${String(error)}`, {
      cause: error as Error,
    });
  }
};

export const parsePoAggregated: AggregateParserFn = (inputs, options) => {
  const builder = new DatasetBuilder();

  for (const [locale, content] of entries(inputs)) {
    const dataset = parsePo(content, {
      ...options,
      targetLocale: locale,
    });

    builder.merge(dataset);
  }

  return builder.build();
};

/**
 * Maps gettext `msgstr[n]` indices to CLDR plural categories. gettext's index
 * 0 is the singular (`one`) and index 1 the plural (`other`); the remaining
 * categories cover languages that declare more than two plural forms.
 *
 * The true index→category mapping is language-specific (defined by each file's
 * `Plural-Forms` rule); absent a plural-rules table this canonical order is a
 * pragmatic, deterministic approximation.
 */
const PO_PLURAL_ORDER: Plurality[] = [
  Plurality.ONE,
  Plurality.OTHER,
  Plurality.TWO,
  Plurality.FEW,
  Plurality.MANY,
  Plurality.ZERO,
];

function extractPlurals(
  targetLocale: Locale,
  entry: GetTextTranslation
): TranslationPluralization | undefined {
  const plurals: TranslationPluralization = {};

  if (!entry.msgid_plural || entry.msgstr.length <= 1) {
    return;
  }

  entry.msgstr.slice(0, PO_PLURAL_ORDER.length).forEach((plural, index) => {
    if (plural.trim().length === 0) return;

    plurals[PO_PLURAL_ORDER[index]] = { [targetLocale]: plural };
  });

  return plurals;
}

export class PoDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.PO> {
  public constructor() {
    super(LanguageFileFormat.PO);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parsePo(input, options);
  }

  /**
   * PO files are single-locale, keyed off {@link ParsingOptions.targetLocale},
   * so each aggregated input is parsed against its own locale.
   */
  public override parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parsePoAggregated(inputs, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializePo(dataset, options);
  }
}
