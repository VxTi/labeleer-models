import type {
  ParserFn,
  SerializationFragment,
  SerializerFn,
  TranslationDataset,
} from '../../types';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { z }                                from 'zod';
import type { Locale }                      from '../../locales';
import { ParsingError, SerializationError } from '../processing-errors';

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

export const serializeAndroidStrings: SerializerFn = (input, config) => {
  try {
    const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> =
      constructPerLanguageDatasets(input, config.locales);

    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
    });
    const outputFragments: SerializationFragment[] = [];

    for (const [locale, dataset] of Object.entries(perLanguageDatasets)) {
      outputFragments.push({
        identifier: locale,
        data: buildXmlDataset(builder, dataset, locale as Locale),
      });
    }

    return outputFragments;
  } catch (e) {
    throw new SerializationError(
      'Something went wrong whilst attempting to serialize Android Strings XML: ',
      { cause: e }
    );
  }
};

function buildXmlDataset(
  builder: XMLBuilder,
  dataset: TranslationDataset,
  locale: Locale
): string {
  const outputIr = {
    resources: { string: [] as SerializationIrFragment[] },
  };

  for (const [key, entry] of Object.entries(dataset)) {
    outputIr.resources.string.push({
      '@_name': key,
      '#text': entry.translations[locale] ?? '',
    });
  }

  const output = builder.build(outputIr);
  return `<?xml version="1.0" encoding="utf-8"?>\n${output}`;
}

function constructPerLanguageDatasets(
  input: TranslationDataset,
  locales: Locale[]
): Partial<Record<Locale, TranslationDataset>> {
  const perLanguageDatasets: Partial<Record<Locale, TranslationDataset>> = {};

  for (const [key, entry] of Object.entries(input)) {
    for (const locale of locales) {
      perLanguageDatasets[locale] = {
        [key]: {
          translations: {
            [locale]: entry.translations[locale] ?? '',
          },
        },
      };
    }
  }

  return perLanguageDatasets;
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

type SerializationIrFragment = z.infer<typeof serializationIrFragmentDecoder>;

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
