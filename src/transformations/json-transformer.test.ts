import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '@/__testutils__';
import { mockDataset } from '@/__testutils__/mock-dataset';
import { mockSerializationOptions } from '@/__testutils__/mock-serialization-options';
import {
  DEFAULT_JSON_FILE_NAME,
  JsonDatasetTransformer,
} from './json-transformer';

const transformer = new JsonDatasetTransformer();

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

    const parsed = transformer.parse(dataset, mockParsingOptions());
    expect(parsed).toBeDefined();
    expect(parsed).toEqual(
      expect.objectContaining({
        'first-entry': {
          plurals: {},
          translations: {
            en_US: 'hello',
            nl_NL: 'world',
          },
        },
        'second-entry': {
          plurals: {},
          translations: {
            en_US: 'hello',
            nl_NL: 'again',
          },
        },
      })
    );
  });
});

describe('json serialization', () => {
  it('should serialize a simple JSON dataset', () => {
    const serialized = transformer.serialize(
      mockDataset(),
      mockSerializationOptions()
    );
    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized[0]?.data).toContain('hello');
    expect(serialized[0]?.data).toContain('again');
    expect(serialized[0]?.filename).toEqual(DEFAULT_JSON_FILE_NAME);
    expect(serialized[0]?.data).toMatchInlineSnapshot(`
      "{
        "first-entry": {
          "plurals": {},
          "translations": {
            "en_US": "hello",
            "nl_NL": "world"
          }
        },
        "second-entry": {
          "plurals": {},
          "translations": {
            "en_US": "hello",
            "nl_NL": "again"
          }
        }
      }"
    `);
  });
});
