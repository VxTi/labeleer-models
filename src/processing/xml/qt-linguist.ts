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
  isLocale,
  type Locale,
  toBCP47,
  toPOSIX,
} from '../../util/locales';
import { ParsingError } from '../processing-errors';

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

export const serializeTs: SerializerFn = (input, config) => {
  const nonReferenceLanguages = config.locales.filter(
    loc => loc !== config.referenceLocale
  );
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
  });

  if (nonReferenceLanguages.length === 0) {
    const fragment = constructTsSerializationFragment(
      builder,
      input,
      undefined,
      config.referenceLocale
    );

    return [fragment];
  }

  return nonReferenceLanguages.map(locale =>
    constructTsSerializationFragment(
      builder,
      input,
      locale,
      config.referenceLocale
    )
  );
};

function constructTsSerializationFragment(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  locale: Locale | undefined,
  referenceLocale: Locale
): SerializationFragment {
  const tsObj = {
    TS: {
      '@_version': '2.1',
      '@_language': toBCP47(referenceLocale),
      context: {
        name: 'Labeleer Translations',
        message: Object.entries(dataset).map(([key, entry]) => ({
          '@_key': key,
          source: entry.translations[referenceLocale],
          // It's not necessary to translate *to* another language
          // as one can also just use TS files for a single language.
          ...(locale ? { translation: entry.translations[locale] || '' } : {}),
        })),
      },
    },
  };

  const content = `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(tsObj)}`;

  return {
    content,
    identifier: toBCP47(locale ?? referenceLocale),
  };
}

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
