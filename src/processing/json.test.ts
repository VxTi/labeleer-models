import { mockDataset } from './__testutils__/mock-dataset';
import { mockParsingOptions } from './__testutils__/mock-parsing-options';
import { mockSerializationOptions } from './__testutils__/mock-serialization-options';
import { parseJson, serializeJson } from './json';
import { expect, describe, it } from 'vitest';

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

describe('json serialization', () => {
  it('should serialize a simple JSON dataset', () => {
    const serialized = serializeJson(mockDataset(), mockSerializationOptions());
    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "content": "{
        "first-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "world"
          },
          "plurals": {
            "en_US": "hellos",
            "nl_NL": "werelden"
          }
        },
        "second-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "again"
          }
        }
      }",
        },
      ]
    `);
  });
});
