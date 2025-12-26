import { XMLParser } from 'fast-xml-parser';
import { DatasetBuilder } from '@/dataset-builder';
import type { ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';
import { type Locale } from '@/locales';
import { XLIFF21Decoder } from '@/transformations/xliff/models';

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

    const srcLang: Locale = xliff['@_srcLang'];
    const tgtLang: Locale | undefined = xliff['@_trgLang'] ?? undefined;

    const units = xliff.file.unit;
    const arr = Array.isArray(units) ? units : [units];

    const datasetBuilder = new DatasetBuilder();

    for (const unit of arr) {
      const key = unit['@_id'];
      const seg = unit.segment;
      const source = seg.source ?? '';
      const target = seg.target ?? '';

      datasetBuilder.addTranslation(key, {
        [srcLang]: source,
        ...(tgtLang ? { [tgtLang]: target } : {}),
      });
    }

    return datasetBuilder.build();
  } catch (e) {
    throw new ParsingError(
      `Failed to parse XLIFF 2.1 content: ${(e as Error).message}`
    );
  }
};
