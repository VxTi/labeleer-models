import { XMLBuilder } from 'fast-xml-parser';
import type {
  ParserFn,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../../types';
import type { Locale } from '../../util/locales';

export const parseTs: ParserFn = input => {
  const parser = new XMLBuilder({
    ignoreAttributes: false,
    parseAttributeValue: true,
  });
};

export const serializeTs: SerializerFn = (input, config) => {
  const nonReferenceLanguages = config.locales.filter(
    loc => loc !== config.referenceLocale
  );
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });

  if (nonReferenceLanguages.length === 0) {
    const fragment = constructTsFragment(
      builder,
      input,
      undefined,
      config.referenceLocale
    );

    return [fragment];
  }

  return nonReferenceLanguages.map(locale =>
    constructTsFragment(builder, input, locale, config.referenceLocale)
  );
};

function constructTsFragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  locale: Locale | undefined,
  referenceLocale: Locale
): SerializationFragment {
  const tsObj = {
    TS: {
      '@_version': '2.1',
      '@_language': referenceLocale,
      context: {
        name: 'Labeleer Translations',
        message: Object.entries(dataset).map(([key, entry]) => ({
          '@_key': key,
          source: entry.translations[referenceLocale],
          // It's not necessary to translate *to* another language
          // as one can also just use TS files for a single language.
          ...(locale ? { translation: entry.translations[locale] || '' } : {}),
        })),
      },
    },
  };

  const content = `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(tsObj)}`;

  return {
    content,
    identifier: locale,
  };
}
