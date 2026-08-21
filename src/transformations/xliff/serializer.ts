import { entries } from '@/util/data-extraction';
import { XMLBuilder } from 'fast-xml-parser';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  SerializationOptions,
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { type Locale, toISO639_1LanguageCode } from '@/locales';

export const serializeXliff: SerializerFn = (input, config) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const nonReferenceLocales: Locale[] = config.locales.filter(
    (loc: Locale) => loc !== config.referenceLocale
  );

  // If there are no non-reference locales, create a single fragment with only the source language.
  if (nonReferenceLocales.length === 0) {
    return serializeSingular(input, builder, config);
  }

  const fragments: SerializationResult[] = [];
  nonReferenceLocales.forEach((locale: Locale) => {
    const dataset: TranslationDataset = {};

    entries(input).forEach(([key, entry]) => {
      dataset[key] = {
        plurals: {},
        translations: {
          [config.referenceLocale]:
            entry.translations[config.referenceLocale] || '',
          [locale]: entry.translations[locale] || '',
        },
      };
    });

    fragments.push(
      constructXliff21Fragment(builder, dataset, locale, config.referenceLocale)
    );
  });

  return fragments;
};

function serializeSingular(
  input: TranslationDataset,
  xmlBuilder: XMLBuilder,
  options: SerializationOptions
): SerializationResult[] {
  const datasetBuilder = new DatasetBuilder();

  entries(input).forEach(([key, entry]) => {
    const locale: Locale = options.referenceLocale;
    const value: string = entry.translations[options.referenceLocale] || '';

    datasetBuilder.addTranslation(key, { [locale]: value });
  });

  const fragment = constructXliff21Fragment(
    xmlBuilder,
    datasetBuilder.build(),
    undefined,
    options.referenceLocale
  );

  return [fragment];
}

// XLIFF 2.1 builder
function constructXliff21Fragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  targetLocale: Locale | undefined,
  sourceLocale: Locale
): SerializationResult {
  const xliffObj = {
    xliff: {
      '@_version': '2.1',
      '@_xmlns': 'urn:oasis:names:tc:xliff:document:2.1',
      '@_srcLang': toISO639_1LanguageCode(sourceLocale),
      ...(targetLocale ?
        { '@_trgLang': toISO639_1LanguageCode(targetLocale) }
      : {}),
      file: {
        '@_id': 'f1',
        unit: Object.entries(dataset).map(([key, entry]) => ({
          '@_id': key,
          segment: {
            source: entry.translations[sourceLocale] || '',
            ...(targetLocale ?
              { target: entry.translations[targetLocale] || '' }
            : {}),
          },
        })),
      },
    },
  };

  const xmlContent = builder.build(xliffObj);

  return {
    filename: targetLocale ?? sourceLocale,
    data: `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`,
  };
}
