import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { SerializationError } from '@/errors';
import type { Locale } from '@/locales';

export type AppleStringsSerializationOptions = {
  /**
   * Determines whether to serialize keys directly instead of using
   * labels. An example of this would be:
   * ```strings
   * "key" = "translation";
   * ```
   * or
   * ```
   * "translation (language A)" = "translation (language B)";
   * ```
   */
  keylessTranslation: boolean;
};

export const serializeAppleStrings: SerializerFn<
  AppleStringsSerializationOptions
> = (input, options) => {
  const fragments = options.locales.map(loc =>
    constructAppleStringsSerializationFragment(
      input,
      options.referenceLocale,
      loc,
      options.keylessTranslation
    )
  );

  return Promise.resolve(fragments);
};

function constructAppleStringsSerializationFragment(
  dataset: TranslationDataset,
  referenceLocale: Locale,
  targetLocale: Locale,
  keylessTranslation: boolean = false
): SerializationResult {
  const kvMapping: Record<string, string> = {};

  for (const [key, entry] of Object.entries(dataset)) {
    const translated = entry.translations?.[targetLocale] ?? '';

    if (keylessTranslation) {
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
    filename: targetLocale,
  };
}

function escapeText(input: string): string {
  return input.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
}
