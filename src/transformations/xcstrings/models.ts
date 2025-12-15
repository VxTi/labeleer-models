import { z } from 'zod';
import { isISO639_1LanguageCode, isLocale, iso639_1ToLocale } from '@/locales';

export type XCStringsDataset = {
  version: string;
  sourceLanguage?: string;
  strings: Record<
    string,
    {
      shouldTranslate: boolean;
      comment: string;
      extractionState: 'manual' | 'automatic';
      localizations: Record<
        string,
        {
          stringUnit: {
            state: 'translated' | 'untranslated';
            value: string;
          };
        }
      >;
    }
  >;
};

export const atomicLocalizationEntry = z.object({
  stringUnit: z.object({
    state: z.string(),
    value: z.string(),
  }),
});

export const pluralLocalizationEntry = z.object({
  variations: z.object({
    plural: z.object({
      zero: atomicLocalizationEntry.optional(),
      one: atomicLocalizationEntry,
      other: atomicLocalizationEntry,
    }),
  }),
});

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
  localizations: z.record(z.string(), localizationValue),
});

export const xcstringsDecoder = z.object({
  version: z.string(),
  sourceLanguage: z.string().optional(),
  strings: z.record(z.string(), translationEntry),
});
