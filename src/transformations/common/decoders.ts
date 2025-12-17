import { z } from 'zod';
import {
  isBCP47Locale,
  isISO639_1LanguageCode,
  isLocale,
  iso639_1ToLocale,
  toPOSIX,
} from '@/locales';

export const LocaleDecoder = z
  .string()
  .transform(val =>
    isISO639_1LanguageCode(val)
      ? iso639_1ToLocale(val)
      : isLocale(val)
        ? val
        : isBCP47Locale(val)
          ? toPOSIX(val)
          : undefined
  )
  .refine(val => val !== undefined, {
    message: 'Invalid locale format',
  });
