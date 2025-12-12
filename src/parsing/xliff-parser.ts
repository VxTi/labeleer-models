import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { ParsingError } from '../errors';
import {
  isBCP47Locale,
  isISO639_1LanguageCode,
  isLocale,
  iso639_1ToLocale,
  type Locale,
  toPOSIX,
} from '../locales';
import type { ParserFn, TranslationDataset } from '../types';

export const parseXliff: ParserFn = input => {
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

    const srcLang: Locale | undefined = xliff['@_srcLang'] ?? undefined;
    const tgtLang: Locale | undefined = xliff['@_trgLang'] ?? undefined;

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

    return Promise.resolve(dataset);
  } catch (e) {
    throw new ParsingError(
      `Failed to parse XLIFF 2.1 content: ${(e as Error).message}`
    );
  }
};

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
