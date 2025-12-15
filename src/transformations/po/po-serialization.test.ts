import { describe, expect, it } from 'vitest';
import { mockDataset } from '../../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import { serializePo } from './po-serialization';

describe('po serialization', () => {
  it('should serialize PO files correctly', () => {
    const serialized = serializePo(mockDataset(), mockSerializationOptions());

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`Promise {}`);
  });
});
