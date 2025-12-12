import YAML from 'yaml';
import type { SerializerFn } from '../types';

export const serializeYaml: SerializerFn = input => {
  return Promise.resolve(YAML.stringify(input));
};
