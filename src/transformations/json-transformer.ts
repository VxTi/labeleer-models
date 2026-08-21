import { JsonTranslationDatasetDecoder } from '@/common';
import type {
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import { ILanguageFileTransformer } from '@/transformer';

export class JsonDatasetTransformer extends ILanguageFileTransformer<
  LanguageFileFormat.JSON,
  ['.json']
> {
  public constructor() {
    super(LanguageFileFormat.JSON, ['.json']);
  }

  public parse(
    input: string,
    _options: ParsingOptions<object>
  ): TranslationDataset {
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
  }

  public serialize(
    dataset: TranslationDataset,
    _options: SerializationOptions
  ): SerializationResult[] {
    const data = JSON.stringify(dataset, null, 2);

    return [
      {
        filename: DEFAULT_JSON_FILE_NAME,
        data,
      },
    ];
  }
}

export const DEFAULT_JSON_FILE_NAME = 'labels';

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
