import { parse } from 'yaml';
import type { ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';
import { JsonTranslationDatasetDecoder } from '@/transformations/common/decoders';

export const parseYaml: ParserFn = input => {
  try {
    const parsedYaml: unknown = parse(input);

    const parsedDataset = JsonTranslationDatasetDecoder.safeParse(parsedYaml);

    if (!parsedDataset.success) {
      throw new ParsingError('YAML dataset is invalid', {
        cause: parsedDataset.error,
      });
    }

    return Promise.resolve(parsedDataset.data);
  } catch (e) {
    throw new ParsingError('Something went wrong whilst trying to parse yaml', {
      cause: e,
    });
  }
};
