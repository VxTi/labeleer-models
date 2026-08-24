import { makeParserSet } from './transformer';
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
