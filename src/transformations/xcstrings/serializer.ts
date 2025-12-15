import merge from 'lodash/merge';
import type {
  XCStringsDataset,
  XCStringsTranslationEntry,
} from '@/transformations/xcstrings/models';
import type { PluralizationQuantity, SerializerFn } from '@/types';

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

    options.locales.forEach(locale => {
      const regularTranslations = entry.translations ?? {};
      const pluralTranslations = entry.plurals ?? {};

      if (regularTranslations[locale]) {
        stringUnit.localizations[locale] = {
          stringUnit: {
            state: 'translated',
            value: regularTranslations[locale] ?? '',
          },
        };
      }

      Object.entries(pluralTranslations).forEach(([qt, entry]) => {
        const quantity = qt as PluralizationQuantity;
        const xcstringPluralQuantityType = quantityToXcstringsType(quantity);

        merge(stringUnit.localizations[locale], {
          [xcstringPluralQuantityType]: {
            state: 'translated',
            value: entry[locale] ?? '',
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
): 'zero' | 'one' | 'other' {
  switch (quantity) {
    case 'zero':
      return 'zero';
    case 'one':
      return 'one';
    default:
      return 'other';
  }
}
