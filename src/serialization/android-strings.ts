import { XMLBuilder }                 from 'fast-xml-parser';
import type { Locale }                                    from '../locales';
import { SerializationError }                                           from '../processing';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../types';

export const serializeAndroidStrings: SerializerFn = (input, config) => {
  try {
    const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> =
      constructPerLanguageDatasets(input, config.locales);

    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
    });
    const outputFragments: SerializationFragment[] = [];

    for (const [locale, dataset] of Object.entries(perLanguageDatasets)) {
      outputFragments.push({
        identifier: locale,
        data: buildXmlDataset(builder, dataset, locale as Locale),
      });
    }

    return outputFragments;
  } catch (e) {
    throw new SerializationError(
      'Something went wrong whilst attempting to serialize Android Strings XML: ',
      { cause: e }
    );
  }
};

function buildXmlDataset(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  locale: Locale
): string {
  const outputIr = {
    resources: { string: [] as Array<{ '@_name': string; '#text': string }> },
  };

  for (const [key, entry] of Object.entries(dataset)) {
    outputIr.resources.string.push({
      '@_name': key,
      '#text': entry.translations[locale] ?? '',
    });
  }

  const output = builder.build(outputIr);
  return `<?xml version="1.0" encoding="utf-8"?>\n${output}`;
}

function constructPerLanguageDatasets(
  input: TranslationDataset,
  locales: Locale[]
): Partial<Record<Locale, TranslationDataset>> {
  const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> = {};

  for (const [key, entry] of Object.entries(input)) {
    for (const locale of locales) {
      perLanguageDatasets[locale] = {
        [key]: {
          translations: {
            [locale]: entry.translations[locale] ?? '',
          },
        },
      };
    }
  }

  return perLanguageDatasets;
}
