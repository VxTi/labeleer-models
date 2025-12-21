import JSZip from 'jszip';
import type {
  SerializationResult,
  SerializationOptions,
  SerializerFn,
  TranslationDataset,
} from './definitions';
import { getFileExtensionsFromFormat, SupportedFormat } from './file-formats';
import {
  serializeTs,
  serializeXcstrings,
  serializeAndroidStrings,
  serializeAppleStrings,
  serializeJson,
  serializePo,
  serializeXliff,
  serializeYaml,
} from '@/transformations';

/**
 * Serializes a TranslationDataset into the specified format using the provided options.
 *
 * @param dataset - The TranslationDataset to be serialized.
 * @param format - The target format for serialization (e.g., JSON, YAML, PO).
 * @param options - Serialization options including referenceLocale and locales.
 * @returns The serialized output as an ArrayBuffer, containing the serialized data (Zipped file).
 */
export async function serializeDataset<TFormat extends SupportedFormat>(
  dataset: TranslationDataset,
  format: TFormat,
  options: SerializationOptions<InferSerializationOptions<TFormat>>
): Promise<ArrayBuffer> {
  const serializerFn = serializerMap[format] as SerializerFn<
    InferSerializationOptions<TFormat>
  >;
  const output: SerializationResult[] = await serializerFn(dataset, options);

  // Alright, we'll have to make a zip of it
  const zip = new JSZip();

  output.forEach(({ filename, data }) => {
    const extension = getFileExtensionsFromFormat(format)[0];
    const fileName = `${filename}${extension}`;

    zip.file(fileName, data);
  });

  return await zip.generateAsync({ type: 'arraybuffer' });
}

type InferSerializationOptions<T extends SupportedFormat> =
  (typeof serializerMap)[T] extends SerializerFn<
    infer InferSerializationOptions
  >
    ? InferSerializationOptions
    : never;

const serializerMap = {
  [SupportedFormat.APPLE_STRINGS]: serializeAppleStrings,
  [SupportedFormat.TS]: serializeTs,
  [SupportedFormat.XLIFF]: serializeXliff,
  [SupportedFormat.ANDROID_STRINGS]: serializeAndroidStrings,
  [SupportedFormat.PO]: serializePo,
  [SupportedFormat.YAML]: serializeYaml,
  [SupportedFormat.JSON]: serializeJson,
  [SupportedFormat.XCSTRINGS]: serializeXcstrings,
} as const;
