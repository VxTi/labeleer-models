import {
  type GetTextTranslation,
  type GetTextTranslations,
  po,
} from 'gettext-parser';
import type { Locale } from '../locales';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../types';

export const serializePo: SerializerFn = (input, options) => {
  const { locales } = options;

  const fragments = locales.map(locale =>
    constructPoSerializationFragment(input, locale)
  );

  return Promise.resolve(fragments);
};

function constructPoSerializationFragment(
  input: TranslationDataset,
  locale: Locale
): SerializationFragment {
  const output: GetTextTranslations = {
    charset: 'UTF-8',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Transfer-Encoding': '8bit',
    },
    translations: { '': {} },
  };

  for (const [key, entry] of Object.entries(input)) {
    const poEntry: GetTextTranslation = {
      msgid: key,
      msgstr: [],
    };

    const translation = entry.translations[locale || ''];

    if (translation) {
      poEntry.msgstr[0] = translation;
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

    if (entry.plurals) {
      const pluralForm = entry.plurals[locale || ''];
      if (pluralForm) {
        poEntry.msgid_plural = pluralForm;
        poEntry.msgstr = [poEntry.msgstr[0] || '', ''];
      }
    }

    output.translations[''][key] = poEntry;
  }

  const data = po.compile(output).toString('utf-8');

  return {
    data,
    identifier: locale,
  };
}
