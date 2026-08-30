import { AndroidStringsDatasetTransformer } from './android-strings-transformer.js';
import { AppleStringsDatasetTransformer } from './apple-strings-transformer.js';
import { JsonDatasetTransformer } from './json-transformer.js';
import { PODatasetTransformer } from './po-transformer.js';
import { TsDatasetTransformer } from './qt-linquist-transformer.js';
import { XCStringsDatasetTransformer } from './xcstrings-transformer.js';
import { XLIFFDatasetTransformer } from './xliff-transformer.js';
import { YamlDatasetTransformer } from './yaml-transformer.js';
import { makeParserSet } from './transformer.js';

export const defaultTransformerSet = makeParserSet([
  JsonDatasetTransformer,
  YamlDatasetTransformer,
  TsDatasetTransformer,
  PODatasetTransformer,
  AndroidStringsDatasetTransformer,
  AppleStringsDatasetTransformer,
  XLIFFDatasetTransformer,
  XCStringsDatasetTransformer,
] as const);
