import { describe, expect, it } from 'vitest';
import { serializeJson } from './serializer';
import { mockDataset } from '@/__testutils__/mock-dataset';
import { mockSerializationOptions } from '@/__testutils__/mock-serialization-options';
import { DEFAULT_JSON_FILE_NAME } from '@/transformations';

describe('json serialization', () => {
  it('should serialize a simple JSON dataset', async () => {
    const serialized = await serializeJson(
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
      }"
    `);
  });
});
