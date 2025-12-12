import { describe, expect, it } from 'vitest';
import { parseYaml }            from './yaml-parser';

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
});
