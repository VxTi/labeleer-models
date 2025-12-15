import { z } from 'zod';
import {
  isBCP47Locale,
  isISO639_1LanguageCode,
  isLocale,
  iso639_1ToLocale,
  toPOSIX,
} from '@/locales';

export const xliff21UnitDecoder = z.object({
  '@_id': z.string(),
  segment: z.object({
    source: z.string().optional(),
    target: z.string().optional(),
  }),
});

export const localeDecoder = z
  .string()
  .transform(val =>
    isISO639_1LanguageCode(val)
      ? iso639_1ToLocale(val)
      : isLocale(val)
        ? val
        : isBCP47Locale(val)
          ? toPOSIX(val)
          : undefined
  );

export const xliff21Decoder = z.object({
  xliff: z.object({
    '@_version': z.string(),
    '@_xmlns': z.string(),
    '@_srcLang': localeDecoder,
    '@_trgLang': localeDecoder.optional(),
    file: z.object({
      '@_id': z.string().optional(),
      unit: z.union([xliff21UnitDecoder, z.array(xliff21UnitDecoder)]),
    }),
  }),
});
