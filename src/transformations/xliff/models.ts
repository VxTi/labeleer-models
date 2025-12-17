import { z } from 'zod';
import { LocaleDecoder } from '../common/decoders';

export const XLIFF21UnitDecoder = z.object({
  '@_id': z.string(),
  segment: z.object({
    source: z.string().optional(),
    target: z.string().optional(),
  }),
});

export const XLIFF21Decoder = z.object({
  xliff: z.object({
    '@_version': z.string(),
    '@_xmlns': z.string(),
    '@_srcLang': LocaleDecoder,
    '@_trgLang': LocaleDecoder.optional(),
    file: z.object({
      '@_id': z.string().optional(),
      unit: z.union([XLIFF21UnitDecoder, z.array(XLIFF21UnitDecoder)]),
    }),
  }),
});
