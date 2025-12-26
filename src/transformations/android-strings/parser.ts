import { XMLParser } from 'fast-xml-parser';
import {
  type ASXmlPluralList,
  type ASXmlSingularEntry,
  ASXmlDecoder,
} from './common';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  AggregateParserFn,
  ParserFn,
  TranslationDataset,
  TranslationPluralization,
} from '@/definitions';
import { ParsingError } from '@/errors';
import type { Locale } from '@/locales';
import { extractArray } from '@/util/data-extraction';

export const parseAndroidStrings: ParserFn = (input, { referenceLocale }) => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const xmlObj: unknown = parser.parse(input);

    const transformed = transformToDataset(xmlObj, referenceLocale);

    return transformed;
  } catch (e) {
    throw new ParsingError(`Failed to parse Android Strings XML: ${String(e)}`);
  }
};

export const parseAndroidStringsAggregated: AggregateParserFn = (
  inputs,
  options
) => {
  const builder = new DatasetBuilder();

  for (const [locale, content] of Object.entries(inputs)) {
    const dataset = parseAndroidStrings(content, {
      ...options,
      referenceLocale: locale as Locale,
    });

    builder.merge(dataset);
  }

  return builder.build();
};

function transformToDataset(
  xmlObj: unknown,
  locale: Locale
): TranslationDataset {
  const ir = ASXmlDecoder.safeParse(xmlObj);
  if (!ir.success) {
    throw new ParsingError('Invalid Android Strings XML structure.', {
      cause: ir.error,
    });
  }

  const datasetBuilder = new DatasetBuilder();

  const singularTranslations: ASXmlSingularEntry[] = extractArray(
    ir.data.resources.string
  );
  const pluralTranslations: ASXmlPluralList[] = extractArray(
    ir.data.resources.plurals
  );

  singularTranslations.forEach((entry: ASXmlSingularEntry) => {
    datasetBuilder.addTranslationForLocale(
      entry['@_name'],
      locale,
      entry['#text']
    );
  });

  pluralTranslations.forEach((entry: ASXmlPluralList) => {
    const key = entry['@_name'];

    datasetBuilder.addPluralEntry(key, extractPluralsFromEntry(entry, locale));
  });

  return datasetBuilder.build();
}

function extractPluralsFromEntry(
  plurals: ASXmlPluralList,
  baseLocale: Locale
): TranslationPluralization {
  return Object.fromEntries<TranslationPluralization>(
    plurals.item.map(({ '@_quantity': key, '#text': value }) => [
      key,
      { [baseLocale]: value },
    ])
  );
}
