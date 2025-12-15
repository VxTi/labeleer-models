import {
  type GetTextTranslation,
  type GetTextTranslations,
  po,
} from 'gettext-parser';
import type { Locale } from '../../locales';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../../types';

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

    if ('translations' in entry) {
      poEntry.msgstr[0] = entry.translations?.[locale] || '';
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

    if ('plurals' in entry) {
      const zero = entry.plurals?.zero?.[locale];
      const one = entry.plurals?.one?.[locale];
      const other = entry.plurals?.other?.[locale];

      if (other) {
        poEntry.msgid_plural = other;
        poEntry.msgstr = [
          zero || poEntry.msgstr[0] || '',
          one || poEntry.msgstr[1] || '',
          other,
        ];
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
