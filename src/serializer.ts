import {
  serializeAndroidStrings,
  serializeJson,
  serializePo,
  serializeTs,
  serializeXliff,
  serializeYaml,
  serializeAppleStrings,
} from './processing';
import type {
  SerializationFragment,
  SerializationOptions,
  SerializerFn,
  TranslationDataset,
} from './types';
import { SupportedFormat } from './util/file-formats';

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
  [SupportedFormat.APPLE_STRINGS]: serializeAppleStrings,
  [SupportedFormat.PO]: serializePo,
  [SupportedFormat.TS]: serializeTs,
  [SupportedFormat.XLIFF]: serializeXliff,
  [SupportedFormat.YAML]: serializeYaml,
};
