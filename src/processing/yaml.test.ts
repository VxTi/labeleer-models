import { describe, it, expect } from 'vitest';
import { mockDataset } from './__testutils__/mock-dataset';
import { mockSerializationOptions } from './__testutils__/mock-serialization-options';
import { parseYaml, serializeYaml } from './yaml';

describe('yaml parsing', () => {
  it('should parse a simple dataset', () => {
    const input = `
    first-entry:
      translations:
        en_US: 'hello world'
        nl_NL: 'hallo wereld'
    `;

    const parsed = parseYaml(input, { referenceLocale: 'en_US' });
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "translations": {
            "en_US": "hello world",
            "nl_NL": "hallo wereld",
          },
        },
      }
    `);
  });

  it('should serialize a simple YAML dataset', () => {
    const serialized = serializeYaml(mockDataset(), mockSerializationOptions());

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "content": "first-entry:
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
