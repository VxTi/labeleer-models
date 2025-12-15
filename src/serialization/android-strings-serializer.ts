import { XMLBuilder } from 'fast-xml-parser';
import { SerializationError } from '../errors';
import type { Locale } from '../locales';
import type {
  PluralizationQuantity,
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

    return Promise.resolve(outputFragments);
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
    resources: {
      string: [] as Array<{ '@_name': string; '#text': string }>,
      plurals: [] as Array<{
        '@_name': string;
        item: Array<{ '@_quantity': string; '#text': string }>;
      }>,
    },
  };

  for (const [key, entry] of Object.entries(dataset)) {
    const translation = entry.translations[locale];

    if (translation) {
      outputIr.resources.string.push({
        '@_name': key,
        '#text': translation,
      });
      continue;
    }

    if (!entry.plurals) continue;

    const items: PluralizedAndroidStringsEntry[] = [];

    for (const quantity of quantities) {
      if (entry.plurals[quantity]?.[locale]) {
        if (items.length > 0) {
          outputIr.resources.plurals.push({
            '@_name': key,
            item: items,
          });
        }
      } else {
        items.push({
          '@_quantity': quantity,
          '#text': entry.plurals[quantity][locale],
        });
      }
    }
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

const quantities = ['zero', 'one', 'two', 'few', 'many', 'other'] as const;

type PluralizedAndroidStringsEntry = {
  '@_quantity': PluralizationQuantity;
  '#text': string;
};
