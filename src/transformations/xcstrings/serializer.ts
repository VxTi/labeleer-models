import merge from 'lodash/merge';
import type {
  XCStringsDataset,
  XCStringsPluralVariations,
  XCStringsTranslationEntry,
} from './common';
import type {
  PluralizationQuantity,
  SerializerFn,
  TranslationLocalizedEntries,
  TranslationPluralization,
} from '@/definitions';
import type { Locale } from '@/locales';

export const serializeXcstrings: SerializerFn = async (dataset, options) => {
  const xcstrings: XCStringsDataset = {
    sourceLanguage: options.referenceLocale,
    strings: {},
    version: '1.0',
  };

  Object.entries(dataset).forEach(([key, entry]) => {
    const stringUnit: XCStringsTranslationEntry = {
      comment: entry.description ?? '',
      extractionState: 'manual',
      localizations: {},
    };

    options.locales.forEach((locale: Locale) => {
      const regularTranslations: TranslationLocalizedEntries =
        entry.translations ?? {};
      const pluralTranslations: TranslationPluralization = entry.plurals ?? {};

      if (regularTranslations[locale]) {
        stringUnit.localizations[locale] = {
          stringUnit: {
            state: 'translated',
            value: regularTranslations[locale] ?? '',
          },
        };
      }

      Object.entries(pluralTranslations).forEach(([qt, entry]) => {
        const variation: XCStringsPluralVariations = quantityToXcstringsType(
          qt as PluralizationQuantity
        );
        merge(stringUnit.localizations, {
          [locale]: {
            variations: {
              plural: {
                [variation]: {
                  stringUnit: {
                    state: 'translated',
                    value: entry[locale] ?? '',
                  },
                },
              },
            },
          },
        });
      });
      xcstrings.strings[key] = stringUnit;
    });
  });

  return Promise.resolve(JSON.stringify(xcstrings, null, 2));
};

function quantityToXcstringsType(
  quantity: PluralizationQuantity
): XCStringsPluralVariations {
  switch (quantity) {
    case 'zero':
    case 'one':
      return quantity;
    default:
      return 'other';
  }
}
