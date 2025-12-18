import { describe, it, expect } from 'vitest';
import { serializeYaml } from './serializer';
import { mockDataset } from '@/__testutils__/mock-dataset';
import { mockSerializationOptions } from '@/__testutils__/mock-serialization-options';

describe('yaml serialization', () => {
  it('should serialize a simple YAML dataset', async () => {
    const serialized = await serializeYaml(
      mockDataset({
        pluralForm: {
          plurals: {
            one: {
              en_US: 'hello',
            },
            other: {
              nl_NL: 'world',
            },
          },
        },
      }),
      mockSerializationOptions()
    );

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "data": "first-entry:
        translations:
          en_US: hello
          nl_NL: world
      second-entry:
        translations:
          en_US: hello
          nl_NL: again
      pluralForm:
        plurals:
          one:
            en_US: hello
          other:
            nl_NL: world
      ",
          "filename": "labels",
        },
      ]
    `);
  });
});
