import type { ParserFn, TranslationDataset } from '@labeleer/models';
import { SupportedFormat } from './file-formats';
import { parseJson } from './processing/json';
import {
  parseAndroidStrings,
  parseTs,
  parseXliff,
  parseXml,
} from './processing/xml';
import { parseYaml } from './processing/yaml';

export function parse(
  input: string,
  format: SupportedFormat
): TranslationDataset | undefined {
  const parser = parserMap[format];
  return parser(input);
}

const _noop = (_: string): undefined => undefined;

const parserMap: Record<SupportedFormat, ParserFn> = {
  [SupportedFormat.ANDROID_STRINGS]: parseAndroidStrings,
  [SupportedFormat.APPLE_STRINGS]: _noop,
  [SupportedFormat.CSV]: _noop,
  [SupportedFormat.JSON]: parseJson,
  [SupportedFormat.PO]: _noop,
  [SupportedFormat.TS]: parseTs,
  [SupportedFormat.XLIFF]: parseXliff,
  [SupportedFormat.XML]: parseXml,
  [SupportedFormat.YAML]: parseYaml,
};
