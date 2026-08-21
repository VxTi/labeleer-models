import { describe, it, expect } from 'vitest';
import { serializeYaml } from './serializer';
import { mockSerializationOptions } from '@/__testutils__';
import { Plurality } from '@/definitions';

describe('yaml serialization', () => {
  it('should serialize a simple YAML dataset', () => {
    const serialized = serializeYaml(
      {
        pluralForm: {
          translations: {},
          plurals: {
            [Plurality.ONE]: {
              en_US: 'hello',
            },
            [Plurality.OTHER]: {
              nl_NL: 'world',
            },
          },
        },
      },
      mockSerializationOptions()
    );

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "data": "pluralForm:
        translations: {}
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
