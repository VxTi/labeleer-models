import { describe, expect, it } from 'vitest';
import { mockDataset } from '../../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import { serializeJson } from './serializer';

describe('json serialization', () => {
  it('should serialize a simple JSON dataset', async () => {
    const serialized = await serializeJson(
      mockDataset(),
      mockSerializationOptions()
    );
    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`Promise {}`);
  });
});
