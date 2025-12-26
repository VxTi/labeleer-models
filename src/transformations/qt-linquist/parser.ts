import { XMLParser } from 'fast-xml-parser';
import { type LinquistTsMessage, TSLinquistDatasetDecoder } from './common';
import { DatasetBuilder } from '@/dataset-builder';
import type { ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';
import { type Locale } from '@/locales';
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
    const translateTo: Locale | undefined = TS['@_language'];

    const datasetBuilder = new DatasetBuilder();

    const messages: LinquistTsMessage[] = extractArray(TS.context.message);

    messages.forEach((msg: LinquistTsMessage) => {
      const key = msg['@_key'];

      datasetBuilder.addTranslation(key, {
        [referenceLocale]: msg.source || '',
        ...(translateTo ? { [translateTo]: msg.translation || '' } : {}),
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
