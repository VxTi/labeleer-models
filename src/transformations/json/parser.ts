import { serializeJson } from './serializer';
import { JsonTranslationDatasetDecoder } from '@/common/decoders';
import type {
  ParserFn,
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import { ILanguageFileTransformer } from '@/transformer';

export const parseJson: ParserFn = input => {
  const json = safeParseJson(input);
  if (!json) {
    throw new ParsingError(
      'Invalid JSON format. Please ensure the input is valid JSON.'
    );
  }

  const result = JsonTranslationDatasetDecoder.safeParse(json);

  if (!result.success) {
    throw new ParsingError('JSON structure is invalid.', {
      cause: result.error,
    });
  }
  return result.data;
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

export class JsonDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.JSON> {
  public constructor() {
    super(LanguageFileFormat.JSON);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseJson(input, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeJson(dataset, options);
  }
}
