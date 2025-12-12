import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type { Locale } from '../locales';
import { ParsingError } from '../processing';
import type { ParserFn, TranslationDataset } from '../types';

export const parseAndroidStrings: ParserFn = (input, { referenceLocale }) => {
  // Requires a locale to parse properly
  if (!referenceLocale) {
    throw new ParsingError('Locale is required to parse Android Strings XML');
  }

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const xmlObj: unknown = parser.parse(input);

    return transformToDataset(xmlObj, referenceLocale);
  } catch (e: unknown) {
    throw new ParsingError(`Failed to parse Android Strings XML: ${String(e)}`);
  }
};
function transformToDataset(
  xmlObj: unknown,
  locale: Locale
): TranslationDataset {
  const ir = serializationIrDecoder.safeParse(xmlObj);
  if (!ir.success) {
    throw new ParsingError('Invalid Android Strings XML structure.', {
      cause: ir.error,
    });
  }

  const dataset: TranslationDataset = {};

  // Handle the case where there's only a single string entry
  if (!Array.isArray(ir.data.resources.string)) {
    return {
      [ir.data.resources.string['@_name']]: {
        translations: {
          [locale]: ir.data.resources.string['#text'],
        },
      },
    };
  }

  for (const stringEntry of ir.data.resources.string) {
    const key = stringEntry['@_name'];
    const translation = stringEntry['#text'];

    dataset[key] = {
      translations: {
        [locale]: translation,
      },
    };
  }

  return dataset;
}

const serializationIrFragmentDecoder = z.object({
  '@_name': z.string(),
  '#text': z.string(),
});

const serializationIrDecoder = z.object({
  resources: z.object({
    // When the user only has a single resource entry, fast-xml-parser
    // will parse it as an object instead of an array.
    string: z.union([
      z.array(serializationIrFragmentDecoder),
      serializationIrFragmentDecoder,
    ]),
  }),
});
