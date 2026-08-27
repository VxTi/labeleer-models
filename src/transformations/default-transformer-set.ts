import { AndroidStringsDatasetTransformer } from './android-strings-transformer';
import { AppleStringsDatasetTransformer } from './apple-strings-transformer';
import { JsonDatasetTransformer } from './json-transformer';
import { PODatasetTransformer } from './po-transformer';
import { TsDatasetTransformer } from './qt-linquist-transformer';
import { XCStringsDatasetTransformer } from './xcstrings-transformer';
import { XLIFFDatasetTransformer } from './xliff-transformer';
import { YamlDatasetTransformer } from './yaml-transformer';
import { makeParserSet } from './transformer';

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
