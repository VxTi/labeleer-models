import { z } from 'zod';
import {
  MAX_TAG_COUNT,
  MAX_TAG_LENGTH,
  MAX_TRANSLATION_DESCRIPTION_LENGTH,
  MAX_TRANSLATION_KEY_LENGTH,
  MIN_TAG_LENGTH,
  MIN_TRANSLATION_KEY_LENGTH,
} from '@/constants';
import { Plurality } from '@/definitions';
import {
  isBCP47Locale,
  isISO639_1LanguageCode,
  isLocale,
  iso639_1ToLocale,
  toPOSIX,
} from '@/locales';
import { sanitizeLabel } from '@/sanitizer';

export const LocaleDecoder = z
  .string()
  .refine(
    val => isISO639_1LanguageCode(val) || isLocale(val) || isBCP47Locale(val),
    { message: 'Invalid locale format' }
  )
  .transform(val =>
    isBCP47Locale(val) ? toPOSIX(val)
    : isISO639_1LanguageCode(val) ? iso639_1ToLocale(val)
    : val
  );

export const TranslationKeyDecoder = z
  .string()
  .transform(input => sanitizeLabel(input))
  .refine(input => input.length > MIN_TRANSLATION_KEY_LENGTH, {
    error: `Translation label must be at least ${MIN_TRANSLATION_KEY_LENGTH} characters long`,
  })
  .refine(input => input.length < MAX_TRANSLATION_KEY_LENGTH, {
    error: `Translation label must be less than ${MAX_TRANSLATION_KEY_LENGTH} characters long`,
  });

export const JsonTranslationDatasetDecoder = z.record(
  TranslationKeyDecoder,
  z.object({
    plurals: z.record(z.enum(Plurality), z.record(LocaleDecoder, z.string())),
    translations: z.record(LocaleDecoder, z.string()),
    description: z.optional(
      z
        .string()
        .refine(
          description =>
            description.length < MAX_TRANSLATION_DESCRIPTION_LENGTH,
          {
            error: `Translation description must be less than ${MAX_TRANSLATION_DESCRIPTION_LENGTH} characters long`,
          }
        )
    ),
    tags: z.optional(
      z
        .array(
          z
            .string()
            .refine(tag => tag.length > MIN_TAG_LENGTH, {
              error: 'Tag cannot be empty',
            })
            .refine(tag => tag.length < MAX_TAG_LENGTH, {
              error: `Tags can at most be ${MAX_TAG_LENGTH} characters long`,
            })
        )
        .refine(tags => tags.length < MAX_TAG_COUNT, {
          error: `There can at most be ${MAX_TAG_COUNT} tags per translation`,
        })
    ),
  })
);
