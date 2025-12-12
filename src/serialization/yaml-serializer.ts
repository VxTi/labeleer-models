import YAML from 'yaml';
import type { SerializerFn } from '../types';

export const serializeYaml: SerializerFn = input => {
  const data = YAML.stringify(input);
  return [{ data }];
};
