import { z } from 'zod';
import { isISO639_1LanguageCode, isLocale, iso639_1ToLocale } from '@/locales';

export const atomicLocalizationEntry = z.object({
  stringUnit: z.object({
    state: z.string(),
    value: z.string(),
  }),
});

export type XCStringsAtomicLocalizationEntry = z.infer<
  typeof atomicLocalizationEntry
>;

export const pluralLocalizationEntry = z.object({
  variations: z.object({
    plural: z.object({
      zero: atomicLocalizationEntry.optional(),
      one: atomicLocalizationEntry,
      other: atomicLocalizationEntry,
    }),
  }),
});

export type XCStringsPluralLocalizationEntry = z.infer<
  typeof pluralLocalizationEntry
>;

export const localeDecoder = z
  .string()
  .transform(val =>
    isISO639_1LanguageCode(val)
      ? iso639_1ToLocale(val)
      : isLocale(val)
        ? val
        : null
  );

export const localizationValue = z.union([
  atomicLocalizationEntry,
  pluralLocalizationEntry,
]);

export const translationEntry = z.object({
  comment: z.string(),
  extractionState: z.enum(['manual']),
  localizations: z.record(/* Locale */ z.string(), localizationValue),
});

export type XCStringsTranslationEntry = z.infer<typeof translationEntry>;

export const xcstringsDecoder = z.object({
  version: z.string(),
  sourceLanguage: z.string().optional(),
  strings: z.record(z.string(), translationEntry),
});

export type XCStringsDataset = z.infer<typeof xcstringsDecoder>;
