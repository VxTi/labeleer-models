import { describe, expect, it } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions }   from '../__testutils__/mock-serialization-options';
import { serializeAndroidStrings }    from './android-strings-serializer';
import type { SerializationFragment } from '../types';

describe('android strings serialization', () => {
  it('should serialize a simple Android Strings dataset', () => {
    const options = mockSerializationOptions({
      locales: ['en_US', 'nl_NL'],
    });
    const dataset = mockDataset();

    const serialized = serializeAndroidStrings(dataset, options) as
      | SerializationFragment[]
      | undefined;
    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(2);
    expect(serialized).toEqual(
      expect.arrayContaining([
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.anything(),
          identifier: 'en_US',
        },
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.anything(),
          identifier: 'nl_NL',
        },
      ])
    );
    expect(serialized?.[0]?.data).toMatchInlineSnapshot(`
        "<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="second-entry">hello</string>
        </resources>
        "
      `);
    expect(serialized?.[1]?.data).toMatchInlineSnapshot(`
        "<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="second-entry">again</string>
        </resources>
        "
      `);
  });
});
