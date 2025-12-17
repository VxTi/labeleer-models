import { XMLParser } from 'fast-xml-parser';
import { type LinquistTsMessage, TSLinquistDatasetDecoder } from './common';
import type { ParserFn, TranslationDataset } from '@/definitions';
import { ParsingError } from '@/errors';
import { type Locale } from '@/locales';

export const parseTs: ParserFn = (input, { referenceLocale }) => {
  if (!referenceLocale) {
    throw new ParsingError(
      'Parsing TS files requires a reference language to be specified.'
    );
  }
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

    const dataset: TranslationDataset = {};

    const messages: LinquistTsMessage[] = Array.isArray(TS.context.message)
      ? TS.context.message
      : [TS.context.message];

    messages.forEach((msg: LinquistTsMessage) => {
      const key = msg['@_key'];

      dataset[key] = {
        translations: {
          [referenceLocale]: msg.source || '',
          ...(translateTo ? { [translateTo]: msg.translation || '' } : {}),
        },
      };
    });

    return Promise.resolve(dataset);
  } catch (e) {
    throw new ParsingError(
      'Something went wrong while trying to parse the TS file.',
      { cause: e }
    );
  }
};
