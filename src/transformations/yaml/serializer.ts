import YAML from 'yaml';
import type { SerializerFn } from '@/definitions';

export const serializeYaml: SerializerFn = input => {
  return Promise.resolve(YAML.stringify(input));
};
