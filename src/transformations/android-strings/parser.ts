import { XMLParser } from 'fast-xml-parser';
import {
  type PluralizedAndroidStringsSetEntry,
  serializationIrDecoder,
  type SingularAndroidStringsEntry,
} from './models';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';
import type {
  AggregateParserFn,
  MaybeArray,
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
    throw new ParsingError(`Failed to parse Android Strings XML: ${String(e)}`);
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

  const stringsEntry: MaybeArray<SingularAndroidStringsEntry> | undefined =
    ir.data.resources.string;
  const strings: SingularAndroidStringsEntry[] = stringsEntry
    ? Array.isArray(stringsEntry)
      ? stringsEntry
      : [stringsEntry]
    : [];
  const plurals: PluralizedAndroidStringsSetEntry[] = ir.data.resources.plurals
    ? Array.isArray(ir.data.resources.plurals)
      ? ir.data.resources.plurals
      : [ir.data.resources.plurals]
    : [];

  strings.forEach(stringEntry => {
    const key = stringEntry['@_name'];
    const translation = stringEntry['#text'];

    dataset[key] = {
      translations: {
        [locale]: translation,
      },
    };
  });

  plurals.forEach(pluralEntry => {
    const key = pluralEntry['@_name'];
    dataset[key] = {
      translations: dataset[key]?.translations ?? {},
      plurals: extractPluralsFromEntry(pluralEntry, locale),
    };
  });

  return dataset;
}

function extractPluralsFromEntry(
  plurals: PluralizedAndroidStringsSetEntry,
  baseLocale: Locale
): TranslationPluralization {
  return Object.fromEntries<TranslationPluralization>(
    plurals.item.map(({ '@_quantity': key, '#text': value }) => [
      key,
      { [baseLocale]: value },
    ])
  );
}
