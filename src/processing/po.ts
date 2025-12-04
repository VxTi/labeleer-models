import {
  type GetTextTranslation,
  type GetTextTranslations,
  po,
} from 'gettext-parser';
import merge from 'lodash/merge';
import type {
  AggregateParserFn,
  ParserFn,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../types';
import { type Locale } from '../util/locales';
import { ParsingError } from './processing-errors';

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

export const serializePo: SerializerFn = (input, options) => {
  const { locales } = options;

  return locales.map(locale => constructPoSerializationFragment(input, locale));
};

function constructPoSerializationFragment(
  input: TranslationDataset,
  locale: Locale
): SerializationFragment {
  const output: GetTextTranslations = {
    charset: 'UTF-8',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Transfer-Encoding': '8bit',
    },
    translations: { '': {} },
  };

  for (const [key, entry] of Object.entries(input)) {
    const poEntry: GetTextTranslation = {
      msgid: key,
      msgstr: [],
    };

    const translation = entry.translations[locale || ''];

    if (translation) {
      poEntry.msgstr[0] = translation;
    }

    if (entry.description) {
      poEntry.comments = {
        extracted: entry.description,
      };
    }

    if (entry.tags) {
      poEntry.comments = poEntry.comments || {};
      poEntry.comments.reference = entry.tags.join('\n');
    }

    if (entry.plurals) {
      const pluralForm = entry.plurals[locale || ''];
      if (pluralForm) {
        poEntry.msgid_plural = pluralForm;
        poEntry.msgstr = [poEntry.msgstr[0] || '', ''];
      }
    }

    output.translations[''][key] = poEntry;
  }

  const content = po.compile(output).toString('utf-8');
  return {
    content,
    identifier: locale,
  };
}
