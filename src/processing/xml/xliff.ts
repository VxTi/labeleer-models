import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type {
  ParserFn,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../../types';
import {
  isBCP47Locale,
  isISO639_1LanguageCode,
  isLocale,
  iso639_1ToLocale,
  type Locale,
  toISO639_1LanguageCode,
  toPOSIX,
} from '../../util/locales';
import { ParsingError } from '../processing-errors';

export const parseXliff: ParserFn = (input, locale) => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const xmlObj: unknown = parser.parse(input);
    const parsed = xliff21Decoder.safeParse(xmlObj);

    if (!parsed.success) {
      throw new Error(
        `The XLIFF 2.1 file structure is invalid: ${parsed.error.message}`
      );
    }

    const xliff = parsed.data.xliff;

    const srcLang: Locale | null | undefined = xliff['@_srcLang'];
    const tgtLang: Locale | undefined = xliff['@_trgLang'] ?? locale;

    if (!srcLang) {
      throw new Error('Source language (srcLang) is missing or invalid.');
    }

    const units = xliff.file.unit;
    const arr = Array.isArray(units) ? units : [units];

    const dataset: TranslationDataset = {};

    for (const unit of arr) {
      const key = unit['@_id'];
      const seg = unit.segment;
      const source = seg.source ?? '';
      const target = seg.target ?? '';

      dataset[key] = {
        translations: {
          [srcLang]: source,
          ...(tgtLang ? { [tgtLang]: target } : {}),
        },
      };
    }

    return dataset;
  } catch (e) {
    throw new ParsingError(
      `Failed to parse XLIFF 2.1 content: ${(e as Error).message}`
    );
  }
};

export const serializeXliff: SerializerFn = (input, config) => {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  const fragments: SerializationFragment[] = [];
  const nonRef = config.locales.filter(l => l !== config.referenceLocale);

  if (nonRef.length === 0) {
    const ds: TranslationDataset = {};
    for (const [key, entry] of Object.entries(input)) {
      ds[key] = {
        translations: {
          [config.referenceLocale]:
            entry.translations[config.referenceLocale] || '',
        },
      };
    }

    return constructXliff21Fragment(
      builder,
      ds,
      undefined,
      config.referenceLocale
    ).content;
  }

  for (const locale of nonRef) {
    const ds: TranslationDataset = {};
    for (const [key, entry] of Object.entries(input)) {
      ds[key] = {
        translations: {
          [config.referenceLocale]:
            entry.translations[config.referenceLocale] || '',
          [locale]: entry.translations[locale] || '',
        },
      };
    }

    fragments.push(
      constructXliff21Fragment(builder, ds, locale, config.referenceLocale)
    );
  }

  return fragments;
};

// XLIFF 2.1 builder
function constructXliff21Fragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  targetLocale: Locale | undefined,
  sourceLocale: Locale
): SerializationFragment {
  const xliffObj = {
    xliff: {
      '@_version': '2.1',
      '@_xmlns': 'urn:oasis:names:tc:xliff:document:2.1',
      '@_srcLang': toISO639_1LanguageCode(sourceLocale),
      ...(targetLocale
        ? { '@_trgLang': toISO639_1LanguageCode(targetLocale) }
        : {}),
      file: {
        '@_id': 'f1',
        unit: Object.entries(dataset).map(([key, entry]) => ({
          '@_id': key,
          segment: {
            source: entry.translations[sourceLocale] || '',
            ...(targetLocale
              ? { target: entry.translations[targetLocale] || '' }
              : {}),
          },
        })),
      },
    },
  };

  const xmlContent = builder.build(xliffObj);

  return {
    identifier: targetLocale,
    content: `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`,
  };
}

// ZOD DECODERS (XLIFF 2.1)
const xliff21UnitDecoder = z.object({
  '@_id': z.string(),
  segment: z.object({
    source: z.string().optional(),
    target: z.string().optional(),
  }),
});

const localeDecoder = z
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

const xliff21Decoder = z.object({
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
