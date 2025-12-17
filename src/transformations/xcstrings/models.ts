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

export type XCStringsPluralVariations = keyof z.infer<
  typeof pluralLocalizationEntry.shape.variations.shape.plural
>;

export type XCStringsPluralLocalizationEntry = z.infer<
  typeof pluralLocalizationEntry
>;

export const LocaleDecoder = z
  .string()
  .transform(val =>
    isISO639_1LanguageCode(val)
      ? iso639_1ToLocale(val)
      : isLocale(val)
        ? val
        : null
  );

export const XCStringsLocalizationEntryDecoder = z.union([
  atomicLocalizationEntry,
  pluralLocalizationEntry,
]);

export const XCStringsTranslationEntryDecoder = z.object({
  comment: z.string(),
  extractionState: z.enum(['manual']),
  localizations: z.record(
    z.string(/* Locale */).refine(val => {
      return LocaleDecoder.safeParse(val).success;
    }),
    XCStringsLocalizationEntryDecoder
  ),
});

export type XCStringsTranslationEntry = z.infer<
  typeof XCStringsTranslationEntryDecoder
>;

export const XCStringsDatasetDecoder = z.object({
  version: z.string(),
  sourceLanguage: z.string().optional(),
  strings: z.record(z.string(), XCStringsTranslationEntryDecoder),
});

export type XCStringsDataset = z.infer<typeof XCStringsDatasetDecoder>;
