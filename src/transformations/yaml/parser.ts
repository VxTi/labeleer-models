import { parse } from 'yaml';
import { serializeYaml } from './serializer';
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

export const parseYaml: ParserFn = input => {
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
    throw new ParsingError('Something went wrong whilst trying to parse yaml', {
      cause: e,
    });
  }
};

export class YamlDatasetTransformer extends ILanguageFileTransformer<LanguageFileFormat.YAML> {
  public constructor() {
    super(LanguageFileFormat.YAML);
  }

  public parse(
    input: string,
    options: ParsingOptions<object>
  ): TranslationDataset {
    return parseYaml(input, options);
  }

  public serialize(
    dataset: TranslationDataset,
    options: SerializationOptions
  ): SerializationResult[] {
    return serializeYaml(dataset, options);
  }
}
