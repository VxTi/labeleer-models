import { z } from 'zod';
import { LocaleDecoder } from '@/transformations/common/decoders';

export const XCStringsAtomicLocalizationEntryDecoder = z.object({
  stringUnit: z.object({
    state: z.string(),
    value: z.string(),
  }),
});

export type XCStringsAtomicLocalizationEntry = z.infer<
  typeof XCStringsAtomicLocalizationEntryDecoder
>;

export const pluralLocalizationEntry = z.object({
  variations: z.object({
    plural: z.object({
      zero: XCStringsAtomicLocalizationEntryDecoder.optional(),
      one: XCStringsAtomicLocalizationEntryDecoder,
      other: XCStringsAtomicLocalizationEntryDecoder,
    }),
  }),
});

export type XCStringsPluralVariations = keyof z.infer<
  typeof pluralLocalizationEntry.shape.variations.shape.plural
>;

export type XCStringsPluralLocalizationEntry = z.infer<
  typeof pluralLocalizationEntry
>;

export const XCStringsLocalizationEntryDecoder = z.union([
  XCStringsAtomicLocalizationEntryDecoder,
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
