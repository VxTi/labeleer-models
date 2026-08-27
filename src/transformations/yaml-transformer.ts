import { JsonTranslationDatasetDecoder } from '@/common';
import type {
  ParsingOptions,
  SerializationOptions,
  SerializationResult,
  TranslationDataset,
} from '@/definitions';
import { ParsingError } from '@/errors';
import { FileFormat } from './file-formats';
import { makeLanguageTransformer } from './transformer';
import YAML, { parse } from 'yaml';

export const YamlDatasetTransformer = makeLanguageTransformer({
  fileFormat: FileFormat.YAML,
  extensions: ['.yml', '.yaml'],
  parse(input: string, _options: ParsingOptions): TranslationDataset {
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
  },

  serialize(
    dataset: TranslationDataset,
    _options: SerializationOptions
  ): SerializationResult {
    const content = YAML.stringify(dataset);

    return {
      [DEFAULT_YAML_FILE_NAME + this.extensions[0]]: { content },
    };
  },
});

export const DEFAULT_YAML_FILE_NAME = 'labels';
