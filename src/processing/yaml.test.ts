import { describe, it, expect } from 'vitest';
import { mockDataset } from './__testutils__/mockDataset';
import { parseYaml, serializeYaml } from './yaml';

describe('yaml parsing', () => {
  it('should parse a simple dataset', () => {
    const input = `
    first-entry:
      translations:
        en_US: 'hello world'
        nl_NL: 'hallo wereld'
    `;

    const parsed = parseYaml(input);
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

  it('should serialize a dataset into yaml correctly', () => {
    const dataset = mockDataset();

    const serialized = serializeYaml(dataset);

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      "first-entry:
        translations:
          en_US: hello
          nl_NL: world
      second-entry:
        translations:
          en_US: hello
          nl_NL: again
      "
    `);
  });
});
