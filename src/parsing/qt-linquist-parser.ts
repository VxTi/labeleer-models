import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { ParsingError } from '../errors';
import { isBCP47Locale, isLocale, type Locale, toPOSIX } from '../locales';
import type { ParserFn, TranslationDataset } from '../types';

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

    const parsed = linquistTsDecoder.safeParse(xmlObj);

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

    return dataset;
  } catch (e) {
    throw new ParsingError(
      'Something went wrong while trying to parse the TS file.',
      { cause: e }
    );
  }
};

const linquistTsMessageDecoder = z.object({
  '@_key': z.string(),
  source: z.string(),
  translation: z.string().optional(),
});

type LinquistTsMessage = z.infer<typeof linquistTsMessageDecoder>;

const linquistTsDecoder = z.object({
  TS: z.object({
    '@_language': z
      .string()
      .transform(val =>
        isLocale(val) ? val : isBCP47Locale(val) ? toPOSIX(val) : undefined
      ),
    context: z.object({
      message: z.union([
        z.array(linquistTsMessageDecoder),
        linquistTsMessageDecoder,
      ]),
    }),
  }),
});
