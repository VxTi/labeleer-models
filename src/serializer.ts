import JSZip from 'jszip';
import type {
  SerializationResult,
  SerializationOptions,
  SerializerFn,
  TranslationDataset,
} from './definitions';
import {
  getFileExtensionsFromFormat,
  LanguageFileFormat,
} from './file-formats';
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
export async function serializeDataset<TFormat extends LanguageFileFormat>(
  dataset: TranslationDataset,
  format: TFormat,
  options: SerializationOptions<InferSerializationOptions<TFormat>>
): Promise<ArrayBuffer> {
  const serializerFn = serializerMap[format] as SerializerFn<
    InferSerializationOptions<TFormat>
  >;
  const output: SerializationResult[] = serializerFn(dataset, options);

  // Alright, we'll have to make a zip of it
  const zip = new JSZip();

  output.forEach(({ filename, data }) => {
    const extension = getFileExtensionsFromFormat(format)[0];
    const fileName = `${filename}${extension}`;

    zip.file(fileName, data);
  });

  return await zip.generateAsync({ type: 'arraybuffer' });
}

type InferSerializationOptions<T extends LanguageFileFormat> =
  (typeof serializerMap)[T] extends SerializerFn<infer TOptions> ? TOptions
  : never;

const serializerMap = {
  [LanguageFileFormat.APPLE_STRINGS]: serializeAppleStrings,
  [LanguageFileFormat.TS]: serializeTs,
  [LanguageFileFormat.XLIFF]: serializeXliff,
  [LanguageFileFormat.ANDROID_STRINGS]: serializeAndroidStrings,
  [LanguageFileFormat.PO]: serializePo,
  [LanguageFileFormat.YAML]: serializeYaml,
  [LanguageFileFormat.JSON]: serializeJson,
  [LanguageFileFormat.XCSTRINGS]: serializeXcstrings,
} as const;
