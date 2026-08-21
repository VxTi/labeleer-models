import type {
  SerializationResult,
  SerializerFn,
  TranslationDataset,
} from '@/definitions';
import { type Locale, toBCP47 } from '@/locales';
import { entries } from '@/util/data-extraction';

export const serializeAppleStrings: SerializerFn = (input, options) => {
  return options.locales.map(loc =>
    constructAppleStringsSerializationFragment(input, loc)
  );
};

function constructAppleStringsSerializationFragment(
  dataset: TranslationDataset,
  targetLocale: Locale
): SerializationResult {
  const kvMapping: Record<string, string> = {};

  for (const [key, entry] of entries(dataset)) {
    kvMapping[key] = entry.translations[targetLocale] ?? '';
  }

  const data = entries(kvMapping)
    .map(([key, value]) => `"${escapeText(key)}" = "${escapeText(value)}";`)
    .join('\n');

  return {
    data,
    // Apple `.strings` files live in BCP 47 named `.lproj` directories
    // (e.g. `en.lproj`, `en-GB.lproj`).
    filename: toBCP47(targetLocale),
  };
}

/**
 * Escapes a string for an Apple `.strings` literal. The backslash must be
 * escaped first so the escapes introduced afterwards are not re-escaped.
 */
function escapeText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}
