import YAML from 'yaml';
import type { SerializerFn } from '@/definitions';
import { DEFAULT_YAML_FILE_NAME } from '@/transformations/yaml/common';

export const serializeYaml: SerializerFn = input => {
  const data = YAML.stringify(input);

  return Promise.resolve([
    {
      filename: DEFAULT_YAML_FILE_NAME,
      data,
    },
  ]);
};
