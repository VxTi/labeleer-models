import { describe, expect, it } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializeJson } from './json-serializer';

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
