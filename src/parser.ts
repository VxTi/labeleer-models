import {
  parseAndroidStrings,
  parseXliff,
  parseXml,
  parseTs,
  parseJson,
  parseYaml,
  parsePo,
  parseAppleStrings,
} from './processing';
import type { ParserFn, TranslationDataset } from './types';
import { SupportedFormat } from './util/file-formats';

export function parse(
  input: string,
  format: SupportedFormat
): TranslationDataset | undefined {
  const parser = parserMap[format];
  return parser(input);
}

const parserMap: Record<SupportedFormat, ParserFn> = {
  [SupportedFormat.ANDROID_STRINGS]: parseAndroidStrings,
  [SupportedFormat.APPLE_STRINGS]: parseAppleStrings,
  [SupportedFormat.JSON]: parseJson,
  [SupportedFormat.PO]: parsePo,
  [SupportedFormat.TS]: parseTs,
  [SupportedFormat.XLIFF]: parseXliff,
  [SupportedFormat.XML]: parseXml,
  [SupportedFormat.YAML]: parseYaml,
};
