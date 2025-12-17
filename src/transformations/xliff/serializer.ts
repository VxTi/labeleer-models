import { XMLBuilder } from 'fast-xml-parser';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { type Locale, toISO639_1LanguageCode } from '@/locales';

export const serializeXliff: SerializerFn = async (input, config) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const fragments: SerializationFragment[] = [];
  const nonReferenceLocales: Locale[] = config.locales.filter(
    (loc: Locale) => loc !== config.referenceLocale
  );

  // If there are no non-reference locales, create a single fragment with only the source language.
  if (nonReferenceLocales.length === 0) {
    const dataset: TranslationDataset = {};

    Object.entries(input).forEach(([key, entry]) => {
      const locale: Locale = config.referenceLocale;
      const value: string = entry.translations?.[config.referenceLocale] || '';

      dataset[key] = {
        translations: {
          [locale]: value,
        },
      };
    });

    return [
      constructXliff21Fragment(
        builder,
        dataset,
        undefined,
        config.referenceLocale
      ),
    ];
  }

  nonReferenceLocales.forEach((locale: Locale) => {
    const dataset: TranslationDataset = {};

    Object.entries(input).forEach(([key, entry]) => {
      dataset[key] = {
        translations: {
          [config.referenceLocale]:
            entry.translations?.[config.referenceLocale] || '',
          [locale]: entry.translations?.[locale] || '',
        },
      };
    });

    fragments.push(
      constructXliff21Fragment(builder, dataset, locale, config.referenceLocale)
    );
  });

  return Promise.resolve(fragments);
};

// XLIFF 2.1 builder
function constructXliff21Fragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  targetLocale: Locale | undefined,
  sourceLocale: Locale
): SerializationFragment {
  const xliffObj = {
    xliff: {
      '@_version': '2.1',
      '@_xmlns': 'urn:oasis:names:tc:xliff:document:2.1',
      '@_srcLang': toISO639_1LanguageCode(sourceLocale),
      ...(targetLocale
        ? { '@_trgLang': toISO639_1LanguageCode(targetLocale) }
        : {}),
      file: {
        '@_id': 'f1',
        unit: Object.entries(dataset).map(([key, entry]) => ({
          '@_id': key,
          segment: {
            source: entry.translations?.[sourceLocale] || '',
            ...(targetLocale
              ? { target: entry.translations?.[targetLocale] || '' }
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
