import { describe, expect, it } from 'vitest';
import type { SerializationFragment } from '../../types';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import {
  parseAndroidStrings,
  serializeAndroidStrings,
} from './android-strings';

describe('Android Strings', () => {
  describe('serialization', () => {
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

  describe('parsing', () => {
    it('should parse a simple android strings XML dataset', () => {
      const input = `<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="first-label">Hello</string>
          <string name="second-label">again</string>
        </resources>`;

      const parsed = parseAndroidStrings(input, { referenceLocale: 'en_US' });
      expect(parsed).toBeDefined();
      expect(parsed).toMatchInlineSnapshot(`
        {
          "first-label": {
            "translations": {
              "en_US": "Hello",
            },
          },
          "second-label": {
            "translations": {
              "en_US": "again",
            },
          },
        }
      `);
    });
  });
});
