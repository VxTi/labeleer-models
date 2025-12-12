import { describe, it, expect } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializeYaml } from './yaml-serializer';

describe('yaml serialization', () => {
  it('should serialize a simple YAML dataset', () => {
    const serialized = serializeYaml(mockDataset(), mockSerializationOptions());

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "data": "first-entry:
        translations:
          en_US: hello
          nl_NL: world
        plurals:
          en_US: hellos
          nl_NL: werelden
      second-entry:
        translations:
          en_US: hello
          nl_NL: again
      ",
        },
      ]
    `);
  });
});
