import { SerializationError } from '@/errors';
import type { Locale } from '@/locales';
import type {
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '@/types';

export interface AppleStringsSerializationOptions {
  /**
   * Determines whether the
   */
  translateDirect: boolean;
}

export const serializeAppleStrings: SerializerFn<
  AppleStringsSerializationOptions
> = (input, options) => {
  const fragments = options.locales.map(loc =>
    constructAppleStringsSerializationFragment(
      input,
      options.referenceLocale,
      loc,
      options.translateDirect
    )
  );

  return Promise.resolve(fragments);
};

function constructAppleStringsSerializationFragment(
  dataset: TranslationDataset,
  referenceLocale: Locale,
  targetLocale: Locale,
  direct: boolean = false
): SerializationFragment {
  const kvMapping: Record<string, string> = {};

  for (const [key, entry] of Object.entries(dataset)) {
    const translated = entry.translations?.[targetLocale] ?? '';

    if (direct) {
      const refTranslation = entry.translations?.[referenceLocale];
      if (!refTranslation) {
        throw new SerializationError(
          `No reference locale set for key "${key}"`
        );
      }

      kvMapping[refTranslation] = translated;
    } else {
      kvMapping[key] = translated;
    }
  }

  const data = Object.entries(kvMapping)
    .map(([key, value]) => `"${escapeText(key)}" = "${escapeText(value)}";`)
    .join('\n');

  return {
    data,
    identifier: targetLocale,
  };
}

function escapeText(input: string): string {
  return input.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}
