import YAML from 'yaml';
import { datasetParser } from '../decoders';
import type { ParserFn, SerializerFn } from '../types';
import { ParsingError } from './processing-errors';

export const parseYaml: ParserFn = input => {
  try {
    const parsedYaml: unknown = YAML.parse(input);

    const parsedDataset = datasetParser.safeParse(parsedYaml);

    if (!parsedDataset.success) {
      throw new ParsingError('YAML dataset is invalid', {
        cause: parsedDataset.error,
      });
    }

    return parsedDataset.data;
  } catch (e) {
    throw new ParsingError(
      'Something went wrong whilst trying to parse yaml: ',
      { cause: e }
    );
  }
};

export const serializeYaml: SerializerFn = input => {
  const content = YAML.stringify(input);
  return [{ content }];
};
