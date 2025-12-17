import JSZip from 'jszip';
import type {
  SerializationFragment,
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
 * @returns The serialized output as a string or an array of SerializationFragments.
 */
export async function serializeDataset<
  TFormat extends SupportedFormat,
  TOptions extends SerializationOptions<InferSerializationOptions<TFormat>>,
>(
  dataset: TranslationDataset,
  format: TFormat,
  options: TOptions
): Promise<string> {
  const serializerFn = serializerMap[format] as SerializerFn<
    InferSerializationOptions<TFormat>
  >;
  const output: string | SerializationFragment[] = await serializerFn(
    dataset,
    options
  );

  if (!Array.isArray(output)) {
    return output; // Singular file serialization
  }

  // Alright, we'll have to make a zip of it
  const zip = new JSZip();

  output.forEach(({ filename, data }) => {
    const extension = getFileExtensionsFromFormat(format)[0];
    const fileName = `${filename}${extension}`;

    zip.file(fileName, data);
  });

  return await zip.generateAsync({ type: 'string' });
}

type InferSerializationOptions<T extends SupportedFormat> =
  (typeof serializerMap)[T] extends SerializerFn<infer F> ? F : never;

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
