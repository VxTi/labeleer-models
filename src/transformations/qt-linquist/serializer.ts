import { entries } from '@/util/data-extraction';
import { XMLBuilder } from 'fast-xml-parser';
import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { type Locale, toBCP47 } from '@/locales';

export const serializeTs: SerializerFn = (input, config) => {
  const nonReferenceLanguages = config.locales.filter(
    loc => loc !== config.referenceLocale
  );
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });

  if (nonReferenceLanguages.length === 0) {
    const fragment = constructTsSerializationFragment(
      builder,
      input,
      undefined,
      config.referenceLocale
    );

    return [fragment];
  }

  return nonReferenceLanguages.map(locale =>
    constructTsSerializationFragment(
      builder,
      input,
      locale,
      config.referenceLocale
    )
  );
};

function constructTsSerializationFragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  locale: Locale | undefined,
  referenceLocale: Locale
): SerializationResult {
  const tsObj = {
    TS: {
      '@_version': '2.1',
      '@_language': toBCP47(referenceLocale),
      context: {
        name: 'Labeleer Translations',
        message: entries(dataset).map(([key, entry]) => ({
          '@_key': key,
          source: entry.translations[referenceLocale],
          // It's not necessary to translate *to* another language
          // as one can also just use TS files for a single language.
          ...(locale ? { translation: entry.translations[locale] || '' } : {}),
        })),
      },
    },
  };

  const data = `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(tsObj)}`;

  return {
    data,
    filename: toBCP47(locale ?? referenceLocale),
  };
}
