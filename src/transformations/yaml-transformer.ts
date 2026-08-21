import { JsonTranslationDatasetDecoder } from '@/common';
import {
  type ParsingOptions,
  type SerializationOptions,
  type SerializationResult,
  type TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { LanguageFileFormat } from '@/file-formats';
import { ILanguageFileTransformer } from '@/transformer';
import YAML, { parse } from 'yaml';

export class YamlDatasetTransformer extends ILanguageFileTransformer<
  LanguageFileFormat.YAML,
  ['.yaml']
> {
  public constructor() {
    super(LanguageFileFormat.YAML, ['.yaml']);
  }

  public parse(
    input: string,
    _options: ParsingOptions<object>
  ): TranslationDataset {
    try {
      const parsedYaml: unknown = parse(input);

      const parsedDataset = JsonTranslationDatasetDecoder.safeParse(parsedYaml);

      if (!parsedDataset.success) {
        throw new ParsingError('YAML dataset is invalid', {
          cause: parsedDataset.error,
        });
      }

      return parsedDataset.data;
    } catch (e) {
      throw new ParsingError(
        'Something went wrong whilst trying to parse yaml',
        {
          cause: e,
        }
      );
    }
  }

  public serialize(
    dataset: TranslationDataset,
    _options: SerializationOptions
  ): SerializationResult[] {
    const data = YAML.stringify(dataset);

    return [
      {
        filename: DEFAULT_YAML_FILE_NAME,
        data,
      },
    ];
  }
}

export const DEFAULT_YAML_FILE_NAME = 'labels';
