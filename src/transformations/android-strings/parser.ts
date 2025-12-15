import { XMLParser } from 'fast-xml-parser';
import { type z } from 'zod';
import {
  type pluralSerializationIrFragmentDecoder,
  serializationIrDecoder,
} from './models';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';
import type {
  AggregateParserFn,
  ParserFn,
  TranslationDataset,
  TranslationPluralization,
} from '@/types';

export const parseAndroidStrings: ParserFn = (input, { referenceLocale }) => {
  // Requires a locale to parse properly
  if (!referenceLocale) {
    throw new ParsingError('Locale is required to parse Android Strings XML');
  }

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const xmlObj: unknown = parser.parse(input);

    const transformed = transformToDataset(xmlObj, referenceLocale);

    return Promise.resolve(transformed);
  } catch (e) {
    throw new ParsingError(
      `Failed to parse Android Strings XML: ${String(e.message)}`
    );
  }
};

export const parseAndroidStringsAggregated: AggregateParserFn = async (
  inputs,
  options
) => {
  const aggregatedDataset: TranslationDataset = {};

  for (const [locale, content] of Object.entries(inputs)) {
    const dataset = await parseAndroidStrings(content, {
      ...options,
      referenceLocale: locale as Locale,
    });

    Object.assign(aggregatedDataset, dataset);
  }

  return Promise.resolve(aggregatedDataset);
};

function transformToDataset(
  xmlObj: unknown,
  locale: Locale
): TranslationDataset {
  const ir = serializationIrDecoder.safeParse(xmlObj);
  if (!ir.success) {
    throw new ParsingError('Invalid Android Strings XML structure.', {
      cause: ir.error,
    });
  }

  const dataset: TranslationDataset = {};

  // Handle the case where there's only a single string entry
  if (!Array.isArray(ir.data.resources.string)) {
    const key = ir.data.resources.string['@_name'];
    const value = ir.data.resources.string['#text'];

    dataset[key] = {
      translations: {
        [locale]: value,
      },
    };
  } else {
    for (const stringEntry of ir.data.resources.string) {
      const key = stringEntry['@_name'];
      const translation = stringEntry['#text'];

      dataset[key] = {
        translations: {
          [locale]: translation,
        },
      };
    }
  }

  if (!Array.isArray(ir.data.resources.plurals)) {
    const key: string = ir.data.resources.plurals['@_name'];

    dataset[key] = {
      translations: dataset?.[key]?.translations ?? {},
      plurals: extractPlurals(ir.data.resources.plurals, locale),
    };
  } else {
    for (const pluralEntry of ir.data.resources.plurals) {
      const key = pluralEntry['@_name'];
      dataset[key] = {
        translations: dataset[key]?.translations ?? {},
        plurals: extractPlurals(pluralEntry, locale),
      };
    }
  }

  return dataset;
}

function extractPlurals(
  plurals: z.infer<typeof pluralSerializationIrFragmentDecoder>,
  baseLocale: Locale
): TranslationPluralization {
  return Object.fromEntries(
    plurals.item.map(({ '@_quantity': key, '#text': value }) => [
      key,
      { [baseLocale]: value },
    ])
  ) as TranslationPluralization;
}
