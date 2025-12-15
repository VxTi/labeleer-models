import { XMLBuilder } from 'fast-xml-parser';
import type {
  AndroidStringsSet,
  PluralizedAndroidStringsEntry,
} from './models';
import { SerializationError } from '@/errors';
import type { Locale } from '@/locales';
import type {
  PluralizationQuantity,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
  TranslationPluralization,
} from '@/types';

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

    if (outputFragments.length === 1) {
      return Promise.resolve(outputFragments[0].data);
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
  const outputIr: AndroidStringsSet = {
    resources: { string: [], plurals: [] },
  };

  for (const [key, entry] of Object.entries(dataset)) {
    const translation = entry.translations?.[locale];

    if (translation) {
      outputIr.resources.string.push({
        '@_name': key,
        '#text': translation,
      });
    }

    const pluralItems: PluralizedAndroidStringsEntry[] = [];

    for (const [quantity, pluralEntry] of Object.entries(entry.plurals ?? {})) {
      const value = pluralEntry[locale];
      pluralItems.push({
        '@_quantity': quantity as PluralizationQuantity,
        '#text': value ?? '',
      });
    }

    if (pluralItems.length > 0) {
      outputIr.resources.plurals.push({
        '@_name': key,
        item: pluralItems,
      });
    }
  }

  const output = builder.build(outputIr);
  return `<?xml version="1.0" encoding="utf-8"?>\n${output}`;
}

/**
 * Constructs per-language datasets from a combined dataset.
 * This is necessary because Android Strings XML files are per-language.
 */
function constructPerLanguageDatasets(
  input: TranslationDataset,
  locales: Locale[]
): Partial<Record<Locale, TranslationDataset>> {
  const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> = {};

  Object.entries(input).forEach(([key, entry]) => {
    locales.forEach((locale: Locale) => {
      const plurals: TranslationPluralization = Object.fromEntries(
        Object.entries(entry.plurals ?? {}).map(([qt, pluralEntry]) => {
          const pluralValue = pluralEntry?.[locale] ?? '';

          return [qt as PluralizationQuantity, { [locale]: pluralValue }];
        })
      );

      perLanguageDatasets[locale] = {
        ...(perLanguageDatasets[locale] ?? {}),
        [key]: {
          translations: {
            [locale]: entry.translations?.[locale] ?? '',
          },
          plurals,
        },
      };
    });
  });

  return perLanguageDatasets;
}
