import { z } from 'zod';
import { isBCP47Locale, isLocale, toPOSIX } from '@/locales';

export const TSLinquistMessageDecoder = z.object({
  '@_key': z.string(),
  source: z.string(),
  translation: z.string().optional(),
});

export type LinquistTsMessage = z.infer<typeof TSLinquistMessageDecoder>;

export const TSLinquistDatasetDecoder = z.object({
  TS: z.object({
    '@_language': z.string().transform(val =>
      isLocale(val) ? val
      : isBCP47Locale(val) ? toPOSIX(val)
      : undefined
    ),
    context: z.object({
      message: z.union([
        z.array(TSLinquistMessageDecoder),
        TSLinquistMessageDecoder,
      ]),
    }),
  }),
});
