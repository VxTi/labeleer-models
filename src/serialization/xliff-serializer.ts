import { XMLBuilder } from 'fast-xml-parser';
import { type Locale, toISO639_1LanguageCode } from '../locales';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../types';

export const serializeXliff: SerializerFn = async (input, config) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const fragments: SerializationFragment[] = [];
  const nonRef = config.locales.filter(l => l !== config.referenceLocale);

  if (nonRef.length === 0) {
    const ds: TranslationDataset = {};
    for (const [key, entry] of Object.entries(input)) {
      ds[key] = {
        translations: {
          [config.referenceLocale]:
            entry.translations[config.referenceLocale] || '',
        },
      };
    }

    return constructXliff21Fragment(
      builder,
      ds,
      undefined,
      config.referenceLocale
    ).data;
  }

  for (const locale of nonRef) {
    const ds: TranslationDataset = {};
    for (const [key, entry] of Object.entries(input)) {
      ds[key] = {
        translations: {
          [config.referenceLocale]:
            entry.translations[config.referenceLocale] || '',
          [locale]: entry.translations[locale] || '',
        },
      };
    }

    fragments.push(
      constructXliff21Fragment(builder, ds, locale, config.referenceLocale)
    );
  }

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
            source: entry.translations[sourceLocale] || '',
            ...(targetLocale
              ? { target: entry.translations[targetLocale] || '' }
              : {}),
          },
        })),
      },
    },
  };

  const xmlContent = builder.build(xliffObj);

  return {
    identifier: targetLocale ?? sourceLocale,
    data: `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`,
  };
}
