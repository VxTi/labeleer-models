import { type ParserSet, ParserSetBuilder } from './transformer';
import {
  AndroidStringsDatasetTransformer,
  AppleStringsDatasetTransformer,
  JsonDatasetTransformer,
  PODatasetTransformer,
  TsDatasetTransformer,
  XCStringsDatasetTransformer,
  XLIFFDatasetTransformer,
  YamlDatasetTransformer,
} from '@/transformations';

/**
 * Builds a {@link ParserSet} containing a transformer for every supported
 * {@link LanguageFileFormat}.
 *
 * Each call returns a fresh, independent set — mutate or extend it via a
 * {@link ParserSetBuilder} without affecting other consumers.
 */
export function createDefaultParserSet(): ParserSet {
  return new ParserSetBuilder()
    .addAll([
      new JsonDatasetTransformer(),
      new YamlDatasetTransformer(),
      new TsDatasetTransformer(),
      new PODatasetTransformer(),
      new AndroidStringsDatasetTransformer(),
      new AppleStringsDatasetTransformer(),
      new XLIFFDatasetTransformer(),
      new XCStringsDatasetTransformer(),
    ])
    .build();
}

/**
 * A shared, ready-to-use {@link ParserSet} covering every supported format.
 */
export const defaultParserSet: ParserSet = createDefaultParserSet();
