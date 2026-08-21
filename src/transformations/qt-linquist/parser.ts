import { XMLParser } from 'fast-xml-parser';
import { type LinquistTsMessage, TSLinquistDatasetDecoder } from './common';
import { serializeTs } from './serializer';
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
import { ILanguageFileTransformer } from '@/transformer';
import { extractArray } from '@/util/data-extraction';

export const parseTs: ParserFn = (input, { referenceLocale }) => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const xmlObj: unknown = parser.parse(input);

    const parsed = TSLinquistDatasetDecoder.safeParse(xmlObj);

    if (!parsed.success) {
      throw new Error(
        `The TS file structure is invalid: ${parsed.error.message}`
      );
    }

    const TS = parsed.data.TS;

    // `sourcelanguage` is the source; fall back to the caller's reference
    // locale for files that omit it. `language` is the target.
    const sourceLocale: Locale = TS['@_sourcelanguage'] ?? referenceLocale;
    const targetLocale: Locale | undefined = TS['@_language'];

    const datasetBuilder = new DatasetBuilder();

    const messages: LinquistTsMessage[] = extractArray(TS.context.message);

    messages.forEach((msg: LinquistTsMessage) => {
      // Qt keys ID-based messages off the `id` attribute; otherwise the
      // source text is the identity.
      const key = msg['@_id'] ?? msg.source;

      datasetBuilder.addTranslation(key, {
        [sourceLocale]: msg.source || '',
        ...(targetLocale && targetLocale !== sourceLocale ?
          { [targetLocale]: msg.translation || '' }
        : {}),
      });
    });

    return datasetBuilder.build();
  } catch (e) {
    throw new ParsingError(
      'Something went wrong while trying to parse the TS file.',
      { cause: e }
    );
  }
};

export class TsDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.TS> {
  public constructor() {
    super(LanguageFileFormat.TS);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseTs(input, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeTs(dataset, options);
  }
}
