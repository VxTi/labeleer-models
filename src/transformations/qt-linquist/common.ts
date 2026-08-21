import { z } from 'zod';
import { isBCP47Locale, isLocale, toPOSIX } from '@/locales';

/**
 * Normalises a Qt language attribute (e.g. `en_US` or `en-US`) to a POSIX
 * {@link Locale}, or `undefined` when it is not a recognised locale.
 */
const localeAttribute = z.string().transform(val =>
  isLocale(val) ? val
  : isBCP47Locale(val) ? toPOSIX(val)
  : undefined
);

export const TSLinquistMessageDecoder = z.object({
  // Qt identifies ID-based messages via the optional `id` attribute; when it
  // is absent the `<source>` text is the identity.
  '@_id': z.string().optional(),
  source: z.string(),
  translation: z.string().optional(),
});

export type LinquistTsMessage = z.infer<typeof TSLinquistMessageDecoder>;

export const TSLinquistDatasetDecoder = z.object({
  TS: z.object({
    '@_sourcelanguage': localeAttribute.optional(),
    '@_language': localeAttribute.optional(),
    context: z.object({
      name: z.string().optional(),
      message: z.union([
        z.array(TSLinquistMessageDecoder),
        TSLinquistMessageDecoder,
      ]),
    }),
  }),
});
