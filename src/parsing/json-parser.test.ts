import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import { parseJson } from './json-parser';

describe('json parsing', () => {
  it('should parse a simple JSON dataset', () => {
    const dataset = `{
    "first-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "world"
    }
  },
  "second-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "again"
    }
  }
  }`;

    const parsed = parseJson(dataset, mockParsingOptions());
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "world",
          },
        },
        "second-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "again",
          },
        },
      }
    `);
  });
});
