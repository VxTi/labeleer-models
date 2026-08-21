import { XMLParser } from 'fast-xml-parser';
import { serializeXliff } from './serializer';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  ParserFn,
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import { type Locale } from '@/locales';
import { XLIFF21Decoder } from '@/transformations/xliff/models';
import { ILanguageFileTransformer } from '@/transformer';

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

export class XLIFFDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.XLIFF> {
  public constructor() {
    super(LanguageFileFormat.XLIFF);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseXliff(input, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeXliff(dataset, options);
  }
}
