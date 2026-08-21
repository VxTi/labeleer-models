import merge from 'lodash-es/merge';
import {
  DEFAULT_XCSTRINGS_FILE_NAME,
  type XCStringsDataset,
  type XCStringsPluralVariations,
  type XCStringsTranslationEntry,
} from './common';
import {
  Plurality,
  type SerializerFn,
  type TranslationLocalizedEntries,
  type TranslationPluralization,
} from '@/definitions';
import type { Locale } from '@/locales';

export const serializeXcstrings: SerializerFn = (dataset, options) => {
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
          qt as Plurality
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

  const data = JSON.stringify(xcstrings, null, 2);

  return [
    {
      filename: DEFAULT_XCSTRINGS_FILE_NAME,
      data,
    },
  ];
};

function quantityToXcstringsType(
  pluralForm: Plurality
): XCStringsPluralVariations {
  switch (pluralForm) {
    case Plurality.ZERO:
    case Plurality.ONE:
      return pluralForm;
    default:
      return 'other';
  }
}
