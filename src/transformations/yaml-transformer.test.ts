import { YamlDatasetTransformer } from '@/transformations/yaml-transformer';
import { describe, it, expect } from 'vitest';
import { mockSerializationOptions } from '@/__testutils__';
import { Plurality } from '@/definitions';

const transformer = new YamlDatasetTransformer();

describe('yaml serialization', () => {
  it('should serialize a simple YAML dataset', () => {
    const serialized = transformer.serialize(
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

describe('yaml parsing', () => {
  it('should parse a simple dataset', () => {
    const input = `
    first-entry:
      translations:
        en_US: 'hello world'
        nl_NL: 'hallo wereld'
    `;

    const parsed = transformer.parse(input, { referenceLocale: 'en_US' });
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "plurals": {},
          "translations": {
            "en_US": "hello world",
            "nl_NL": "hallo wereld",
          },
        },
      }
    `);
  });
});
