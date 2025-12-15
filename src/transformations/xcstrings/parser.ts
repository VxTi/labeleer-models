import { type z } from 'zod';
import {
  type atomicLocalizationEntry,
  localeDecoder,
  type localizationValue,
  xcstringsDecoder,
} from './models';
import { ParsingError } from '@/errors';
import { type Locale } from '@/locales';
import type { ParserFn, TranslationDataset } from '@/types';

export const parseXcstrings: ParserFn = async dataset => {
  const decoded = await xcstringsDecoder.safeParseAsync(dataset);

  if (!decoded.success) {
    throw new ParsingError(
      `Failed to parse xcstrings: ${decoded.error.message}`
    );
  }

  const result: TranslationDataset = {};

  Object.entries(decoded.data.strings).forEach(([key, entry]) => {
    result[key] = { translations: {} };

    Object.entries(entry.localizations).forEach(
      ([unsafeLocale, localization]) => {
        const localeParseResult = localeDecoder.safeParse(unsafeLocale);

        if (!localeParseResult.success || !localeParseResult.data) {
          throw new ParsingError(
            `Invalid locale code in xcstrings for key "${key}": ${unsafeLocale}`
          );
        }

        const locale: Locale = localeParseResult.data;

        if (isAtomicLocalizationEntry(localization)) {
          result[key].translations ??= {};
          result[key].translations[locale] = localization.stringUnit.value;
        } else {
          // It's a plural translation!
          const pluralVariations = localization.variations.plural;
          const zero = pluralVariations.zero?.stringUnit.value;
          const one = pluralVariations.one.stringUnit.value;
          const other = pluralVariations.other.stringUnit.value;

          result[key].plurals = {
            ...(result[key].plurals ?? {}),
            ...(zero ? { zero: { [locale]: zero } } : {}),
            one: { [locale]: one },
            other: { [locale]: other },
          };
        }
      }
    );
  });

  return result;
};

function isAtomicLocalizationEntry(
  entry: z.infer<typeof localizationValue>
): entry is z.infer<typeof atomicLocalizationEntry> {
  return typeof entry === 'object' && entry !== null && 'stringUnit' in entry;
}
