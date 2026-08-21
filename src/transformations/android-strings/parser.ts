import { XMLParser } from 'fast-xml-parser';
import {
  type ASXmlPluralList,
  type ASXmlSingularEntry,
  ASXmlDecoder,
} from './common';
import { serializeAndroidStrings } from './serializer';
import { DatasetBuilder } from '@/dataset-builder';
import type {
  AggregateParserFn,
  ParserFn,
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
  TranslationPluralization,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import type { Locale } from '@/locales';
import { ILanguageFileTransformer } from '@/transformer';
import { entries, extractArray } from '@/util/data-extraction';

export const parseAndroidStrings: ParserFn = (input, { referenceLocale }) => {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const xmlObj: unknown = parser.parse(input);

    const transformed = transformToDataset(xmlObj, referenceLocale);

    return transformed;
  } catch (e) {
    throw new ParsingError(`Failed to parse Android Strings XML: ${String(e)}`);
  }
};

export const parseAndroidStringsAggregated: AggregateParserFn = (
  inputs,
  options
) => {
  const builder = new DatasetBuilder();

  for (const [referenceLocale, content] of entries(inputs)) {
    const dataset = parseAndroidStrings(content, {
      ...options,
      referenceLocale,
    });

    builder.merge(dataset);
  }

  return builder.build();
};

function transformToDataset(
  xmlObj: unknown,
  locale: Locale
): TranslationDataset {
  const ir = ASXmlDecoder.safeParse(xmlObj);
  if (!ir.success) {
    throw new ParsingError('Invalid Android Strings XML structure.', {
      cause: ir.error,
    });
  }

  const datasetBuilder = new DatasetBuilder();

  const singularTranslations: ASXmlSingularEntry[] = extractArray(
    ir.data.resources.string
  );
  const pluralTranslations: ASXmlPluralList[] = extractArray(
    ir.data.resources.plurals
  );

  singularTranslations.forEach((entry: ASXmlSingularEntry) => {
    datasetBuilder.addTranslationForLocale(
      entry['@_name'],
      locale,
      unescapeAndroidText(entry['#text'])
    );
  });

  pluralTranslations.forEach((entry: ASXmlPluralList) => {
    const key = entry['@_name'];

    datasetBuilder.addPluralEntry(key, extractPluralsFromEntry(entry, locale));
  });

  return datasetBuilder.build();
}

function extractPluralsFromEntry(
  plurals: ASXmlPluralList,
  baseLocale: Locale
): TranslationPluralization {
  return Object.fromEntries<TranslationPluralization>(
    plurals.item.map(({ '@_quantity': key, '#text': value }) => [
      key,
      { [baseLocale]: unescapeAndroidText(value) },
    ])
  );
}

/**
 * Reverses Android string-resource escaping: `\\`, `\'`, `\"` and the
 * `\n`/`\t` control escapes. XML entities are already resolved by the parser.
 */
function unescapeAndroidText(input: string): string {
  return input.replace(/\\(.)/g, (_, escaped: string) => {
    switch (escaped) {
      case 'n':
        return '\n';
      case 't':
        return '\t';
      default:
        return escaped;
    }
  });
}

export class AndroidStringsDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.ANDROID_STRINGS> {
  public constructor() {
    super(LanguageFileFormat.ANDROID_STRINGS);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseAndroidStrings(input, options);
  }

  public override parseAggregate(
    inputs: Partial<Record<Locale, string>>,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseAndroidStringsAggregated(inputs, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeAndroidStrings(dataset, options);
  }
}
