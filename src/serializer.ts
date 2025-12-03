import type { SerializerFn, TranslationDataset } from '@labeleer/models';
import { SupportedFormat } from './file-formats';
import { serializeJson } from './processing/json';
import {
  serializeAndroidStrings,
  serializeTs,
  serializeXliff,
  serializeXml,
} from './processing/xml';
import { serializeYaml } from './processing/yaml';

export function serialize(
  dataset: TranslationDataset,
  format: SupportedFormat
): string | undefined {
  const serializer = serializerMap[format];

  return serializer(dataset);
}

const serializerMap: Record<SupportedFormat, SerializerFn> = {
  [SupportedFormat.JSON]: serializeJson,
  [SupportedFormat.ANDROID_STRINGS]: serializeAndroidStrings,
  [SupportedFormat.APPLE_STRINGS]: () => undefined,
  [SupportedFormat.CSV]: () => undefined,
  [SupportedFormat.PO]: () => undefined,
  [SupportedFormat.TS]: serializeTs,
  [SupportedFormat.XLIFF]: serializeXliff,
  [SupportedFormat.XML]: serializeXml,
  [SupportedFormat.YAML]: serializeYaml,
};
