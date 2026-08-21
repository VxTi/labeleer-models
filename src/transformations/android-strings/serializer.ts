import { entries } from '@/util/data-extraction';
import { XMLBuilder } from 'fast-xml-parser';
import merge from 'lodash-es/merge';
import type { ASSerializationOutputSet, ASXmlPluralEntry } from './common';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
  TranslationPluralization,
} from '@/definitions';
import { SerializationError } from '@/errors';
import {
  getCountryFromLocale,
  type Locale,
  toISO639_1LanguageCode,
} from '@/locales';

export const serializeAndroidStrings: SerializerFn = (input, config) => {
  try {
    const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> =
      constructPerLanguageDatasets(input, config.locales);

    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
    });
    const outputFragments: SerializationResult[] = [];

    for (const [locale, dataset] of entries(perLanguageDatasets)) {
      const data = buildXmlDataset(builder, dataset, locale);

      const filename = `${androidValuesDirectory(locale, config.locales)}/strings`;

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

  entries(dataset).forEach(([key, entry]) => {
    const translation = entry.translations[locale];

    if (translation) {
      outputIr.resources.string.push({
        '@_name': key,
        '#text': escapeAndroidText(translation),
      });
    }

    const pluralItems: ASXmlPluralEntry[] = [];

    entries(entry.plurals ?? {}).forEach(([quantity, pluralEntry]) => {
      const value = pluralEntry[locale];
      pluralItems.push({
        '@_quantity': quantity,
        '#text': escapeAndroidText(value ?? ''),
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
 * Escapes Android string-resource special characters. XML entities (`<`, `>`,
 * `&`) are handled by the XML builder; here we handle Android's own escapes:
 * the backslash, apostrophe and double-quote (which aapt would otherwise
 * reject or strip), plus newline and tab.
 *
 * @see https://developer.android.com/guide/topics/resources/string-resource#escaping_quotes
 */
function escapeAndroidText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

/**
 * Resolves the Android resource directory for a locale. Uses the plain
 * language qualifier (`values-en`) unless multiple requested locales share the
 * same language, in which case the region qualifier is added (`values-en-rGB`)
 * to avoid collisions.
 *
 * @see https://developer.android.com/guide/topics/resources/providing-resources#AlternativeResources
 */
function androidValuesDirectory(locale: Locale, locales: Locale[]): string {
  const language = toISO639_1LanguageCode(locale);

  const sharesLanguage =
    locales.filter(other => toISO639_1LanguageCode(other) === language).length >
    1;

  const region = getCountryFromLocale(locale);

  return sharesLanguage && region ?
      `values-${language}-r${region}`
    : `values-${language}`;
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

      const pluralEntries = entries(entry.plurals ?? {});

      const plurals: TranslationPluralization = Object.fromEntries(
        pluralEntries.map(([qt, pluralEntry]) => {
          const pluralValue = pluralEntry[locale] ?? '';

          return [qt, { [locale]: pluralValue }];
        })
      );

      if (pluralEntries.length > 0) {
        builder.addPluralEntry(key, plurals);
      } else {
        builder.addTranslation(key, {
          [locale]: entry.translations[locale] ?? '',
        });
      }

      perLanguageDatasets[locale] ??= {};
      merge(perLanguageDatasets[locale], builder.build());
    });
  });

  return perLanguageDatasets;
}
