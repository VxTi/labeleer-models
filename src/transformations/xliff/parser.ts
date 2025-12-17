import { XMLParser } from 'fast-xml-parser';
import { ParsingError } from '@/errors';
import { type Locale } from '@/locales';
import { XLIFF21Decoder } from '@/transformations/xliff/models';
import type { ParserFn, TranslationDataset } from '@/types';

export const parseXliff: ParserFn = input => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const xmlObj: unknown = parser.parse(input);
    const parsed = XLIFF21Decoder.safeParse(xmlObj);

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
