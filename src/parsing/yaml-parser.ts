import YAML from 'yaml';
import { datasetParser } from '../decoders';
import { ParsingError } from '../errors';
import type { ParserFn } from '../types';

export const parseYaml: ParserFn = input => {
  try {
    const parsedYaml: unknown = YAML.parse(input);

    const parsedDataset = datasetParser.safeParse(parsedYaml);

    if (!parsedDataset.success) {
      throw new ParsingError('YAML dataset is invalid', {
        cause: parsedDataset.error,
      });
    }

    return Promise.resolve(parsedDataset.data);
  } catch (e) {
    throw new ParsingError(
      'Something went wrong whilst trying to parse yaml: ',
      { cause: e }
    );
  }
};
