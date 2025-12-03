import type {
  SerializationFragment,
  SerializationOptions,
  SerializerFn,
  TranslationDataset,
} from '@labeleer/models';
import { serializeAndroidStrings } from './processing/xml/android-strings';
import { serializeTs } from './processing/xml/qt-linguist';
import { serializeXliff } from './processing/xml/xliff';
import { SupportedFormat } from './util/file-formats';
import { serializeJson } from './processing/json';
import { serializeXml } from './processing/xml/xml';
import { serializeYaml } from './processing/yaml';

export function serialize(
  dataset: TranslationDataset,
  format: SupportedFormat,
  options: SerializationOptions
): SerializationFragment[] | string | undefined {
  const serializer = serializerMap[format];

  return serializer?.(dataset, options);
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
