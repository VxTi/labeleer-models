import { z } from 'zod';
import { ParsingError } from '../errors';
import { isISO639_1LanguageCode, isLocale, iso639_1ToLocale } from '../locales';
import type { ParserFn, TranslationDataset } from '../types';

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

        const locale = localeParseResult.data;

        if (isAtomicLocalizationEntry(localization)) {
          result[key].translations[locale] = localization.stringUnit.value;
        } else {
          // It's a plural translation!
          const pluralVariations = localization.variations.plural;
          result[key].plurals = result[key].plurals || {};
          result[key].plurals[locale] = {};
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

const atomicLocalizationEntry = z.object({
  stringUnit: z.object({
    state: z.string(),
    value: z.string(),
  }),
});

const pluralLocalizationEntry = z.object({
  variations: z.object({
    plural: z.object({
      zero: atomicLocalizationEntry.optional(),
      one: atomicLocalizationEntry,
      other: atomicLocalizationEntry,
    }),
  }),
});

const localeDecoder = z
  .string()
  .transform(val =>
    isISO639_1LanguageCode(val)
      ? iso639_1ToLocale(val)
      : isLocale(val)
        ? val
        : null
  );

const localizationValue = z.union([
  atomicLocalizationEntry,
  pluralLocalizationEntry,
]);

const translationEntry = z.object({
  comment: z.string(),
  extractionState: z.enum(['manual']),
  localizations: z.record(z.string(), localizationValue),
});

const xcstringsDecoder = z.object({
  version: z.string(),
  sourceLanguage: z.string().optional(),
  strings: z.record(z.string(), translationEntry),
});
