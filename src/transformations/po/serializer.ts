import { entries } from '@/util/data-extraction';
import {
  type GetTextTranslation,
  type GetTextTranslations,
  po,
} from 'gettext-parser';
import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { type Locale, toISO639_1LanguageCode } from '@/locales';

export const serializePo: SerializerFn = (input, options) => {
  const { locales, referenceLocale } = options;

  const fragments: SerializationResult[] = locales.map((locale: Locale) =>
    constructPoSerializationFragment(input, locale, referenceLocale)
  );

  return fragments;
};

function constructPoSerializationFragment(
  input: TranslationDataset,
  locale: Locale,
  referenceLocale: Locale
): SerializationResult {
  // TODO: Add support for more headers (e.g., Project-Id-Version, POT-Creation-Date, etc.)
  // And also different encoding types
  const output: GetTextTranslations = {
    charset: 'UTF-8',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Transfer-Encoding': '8bit',
      Language: toISO639_1LanguageCode(locale),
      // gettext needs Plural-Forms to interpret msgstr[n]. We emit the common
      // two-form rule (as used by English/Germanic languages); consequently
      // only the `one`/`other` forms are exported.
      'Plural-Forms': 'nplurals=2; plural=(n != 1);',
    },
    translations: { '': {} },
  };

  for (const [key, entry] of entries(input)) {
    const poEntry: GetTextTranslation = {
      msgid: key,
      msgstr: [],
    };

    if ('translations' in entry) {
      poEntry.msgstr[0] = entry.translations[locale] || '';
    }

    if (entry.description) {
      poEntry.comments = {
        extracted: entry.description,
      };
    }

    if (entry.tags) {
      poEntry.comments = poEntry.comments || {};
      poEntry.comments.reference = entry.tags.join('\n');
    }

    const one = entry.plurals?.one?.[locale];
    const other = entry.plurals?.other?.[locale];

    if (one !== undefined || other !== undefined) {
      // `msgid_plural` is the source-language plural form; `msgstr[0]`/`[1]`
      // are the target's singular (`one`) and plural (`other`) translations.
      poEntry.msgid_plural = entry.plurals?.other?.[referenceLocale] ?? key;
      poEntry.msgstr = [one ?? '', other ?? ''];
    }

    output.translations[''][key] = poEntry;
  }

  const data = po.compile(output).toString('utf-8');

  return {
    data,
    filename: locale,
  };
}
