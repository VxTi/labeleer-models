import { XMLBuilder } from 'fast-xml-parser';
import merge from 'lodash-es/merge';
import type { ASSerializationOutputSet, ASXmlPluralEntry } from './common';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  PluralizationQuantity,
  SerializationResult,
  SerializerFn,
  TranslationDataset,
  TranslationPluralization,
} from '@/definitions';
import { SerializationError } from '@/errors';
import { type Locale, toISO639_1LanguageCode } from '@/locales';

export const serializeAndroidStrings: SerializerFn = (input, config) => {
  try {
    const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> =
      constructPerLanguageDatasets(input, config.locales);

    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
    });
    const outputFragments: SerializationResult[] = [];

    for (const [locale, dataset] of Object.entries(perLanguageDatasets)) {
      const data = buildXmlDataset(builder, dataset, locale as Locale);

      const filename = `values-${toISO639_1LanguageCode(locale as Locale)}/strings`;

      outputFragments.push({ filename, data });
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
  const outputIr: ASSerializationOutputSet = {
    resources: { string: [], plurals: [] },
  };

  Object.entries(dataset).forEach(([key, entry]) => {
    const translation = entry.translations?.[locale];

    if (translation) {
      outputIr.resources.string.push({
        '@_name': key,
        '#text': translation,
      });
    }

    const pluralItems: ASXmlPluralEntry[] = [];

    Object.entries(entry.plurals ?? {}).forEach(([quantity, pluralEntry]) => {
      const value = pluralEntry[locale];
      pluralItems.push({
        '@_quantity': quantity as PluralizationQuantity,
        '#text': value ?? '',
      });
    });

    if (pluralItems.length > 0) {
      outputIr.resources.plurals.push({
        '@_name': key,
        item: pluralItems,
      });
    }
  });

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
      const builder = new DatasetBuilder();

      const pluralEntries = Object.entries(entry.plurals ?? {});

      const plurals: TranslationPluralization = Object.fromEntries(
        pluralEntries.map(([qt, pluralEntry]) => {
          const pluralValue = pluralEntry[locale] ?? '';

          return [qt as PluralizationQuantity, { [locale]: pluralValue }];
        })
      );

      if (pluralEntries.length > 0) {
        builder.addPluralEntry(key, plurals);
      } else {
        builder.addTranslation(key, {
          [locale]: entry.translations?.[locale] ?? '',
        });
      }

      perLanguageDatasets[locale] ??= {};
      merge(perLanguageDatasets[locale], builder.build());
    });
  });

  return perLanguageDatasets;
}
