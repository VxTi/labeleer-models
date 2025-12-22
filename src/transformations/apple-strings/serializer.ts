import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import type { Locale } from '@/locales';

export const serializeAppleStrings: SerializerFn = (input, options) => {
  const fragments = options.locales.map(loc =>
    constructAppleStringsSerializationFragment(input, loc)
  );

  return Promise.resolve(fragments);
};

function constructAppleStringsSerializationFragment(
  dataset: TranslationDataset,
  targetLocale: Locale
): SerializationResult {
  const kvMapping: Record<string, string> = {};

  for (const [key, entry] of Object.entries(dataset)) {
    kvMapping[key] = entry.translations?.[targetLocale] ?? '';
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
