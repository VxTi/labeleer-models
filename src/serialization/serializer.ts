import JSZip from 'jszip';
import { getFileExtensionsFromFormat, SupportedFormat } from '../file-formats';
import type {
  SerializationOptions,
  SerializerFn,
  TranslationDataset,
} from '../types';
import { serializeAndroidStrings } from './android-strings-serializer';
import { serializeAppleStrings } from './apple-strings-serializer';
import { serializeJson } from './json-serializer';
import { serializePo } from './po-serialization';
import { serializeTs } from './qt-linquist-serializer';
import { serializeXliff } from './xliff-serializer';
import { serializeYaml } from './yaml-serializer';

/**
 * Serializes a TranslationDataset into the specified format using the provided options.
 *
 * @param dataset - The TranslationDataset to be serialized.
 * @param format - The target format for serialization (e.g., JSON, YAML, PO).
 * @param options - Serialization options including referenceLocale and locales.
 * @returns The serialized output as a string or an array of SerializationFragments.
 */
export async function serializeDataset<
  TFormat extends SupportedFormat,
  TOptions extends SerializationOptions<InferSerializationOptions<TFormat>>,
>(
  dataset: TranslationDataset,
  format: SupportedFormat,
  options: TOptions
): Promise<string> {
  const serialized = await serializerMap[format](dataset, options);

  if (!Array.isArray(serialized)) {
    return serialized; // Singular file serialization
  }

  // Alright, we'll have to make a zip of it
  const zip = new JSZip();
  for (const fragment of serialized) {
    const extension = getFileExtensionsFromFormat(format)[0];
    const fileName = `${fragment.identifier}${extension}`;

    zip.file(fileName, fragment.data);
  }

  return await zip.generateAsync({ type: 'string' });
}

type InferSerializationOptions<T> = T extends SerializerFn<infer F> ? F : never;

const serializerMap: Record<SupportedFormat, SerializerFn> = {
  [SupportedFormat.APPLE_STRINGS]: serializeAppleStrings,
  [SupportedFormat.TS]: serializeTs,
  [SupportedFormat.XLIFF]: serializeXliff,
  [SupportedFormat.ANDROID_STRINGS]: serializeAndroidStrings,
  [SupportedFormat.PO]: serializePo,
  [SupportedFormat.YAML]: serializeYaml,
  [SupportedFormat.JSON]: serializeJson,
};
