import { entries } from '@/util/data-extraction';
import { type z } from 'zod';
import {
  type XCStringsAtomicLocalizationEntryDecoder,
  type XCStringsLocalizationEntryDecoder,
  XCStringsDatasetDecoder,
} from './common';
import { serializeXcstrings } from './serializer';
import { LocaleDecoder } from '@/common/decoders';
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
import { tryParseJson } from '@/util/parsing';

export const parseXcstrings: ParserFn = dataset => {
  const json = tryParseJson(dataset);
  if (!json) {
    throw new ParsingError('Invalid JSON format for xcstrings dataset');
  }
  const decoded = XCStringsDatasetDecoder.safeParse(json);

  if (!decoded.success) {
    throw new ParsingError(
      `Failed to parse xcstrings: ${decoded.error.message}`
    );
  }

  const datasetBuilder = new DatasetBuilder();

  entries(decoded.data.strings).forEach(([key, entry]) => {
    entries(entry.localizations).forEach(([unsafeLocale, localization]) => {
      const localeParseResult = LocaleDecoder.safeParse(unsafeLocale);

      if (!localeParseResult.success) {
        throw new ParsingError(
          `Invalid locale code in xcstrings for key "${key}": ${unsafeLocale}`
        );
      }

      const locale: Locale = localeParseResult.data;

      if (isAtomicLocalizationEntry(localization)) {
        datasetBuilder.addTranslation(key, {
          [locale]: localization.stringUnit.value,
        });
      } else {
        // It's a plural translation!
        const pluralVariations = localization.variations.plural;
        const zero = pluralVariations.zero?.stringUnit.value;
        const one = pluralVariations.one.stringUnit.value;
        const other = pluralVariations.other.stringUnit.value;

        datasetBuilder.addPluralEntry(key, {
          ...(zero ? { zero: { [locale]: zero } } : {}),
          one: { [locale]: one },
          other: { [locale]: other },
        });
      }
    });
  });

  return datasetBuilder.build();
};

function isAtomicLocalizationEntry(
  entry: z.infer<typeof XCStringsLocalizationEntryDecoder>
): entry is z.infer<typeof XCStringsAtomicLocalizationEntryDecoder> {
  return typeof entry === 'object' && 'stringUnit' in entry;
}

export class XCStringsDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.XCSTRINGS> {
  public constructor() {
    super(LanguageFileFormat.XCSTRINGS);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseXcstrings(input, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeXcstrings(dataset, options);
  }
}
