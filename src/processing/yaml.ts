import type { ParserFn, SerializerFn } from '@labeleer/models';
import YAML from 'yaml';
import { datasetParser } from '../decoders';

export const parseYaml: ParserFn = input => {
  try {
    const parsedYaml: unknown = YAML.parse(input);

    const parsedDataset = datasetParser.safeParse(parsedYaml);

    return parsedDataset.success ? parsedDataset.data : undefined;
  } catch (e) {
    console.error('Something went wrong whilst trying to parse yaml: ', e);
    return undefined;
  }
};

export const serializeYaml: SerializerFn = input => {
  const content = YAML.stringify(input);
  return [{ content }];
};
