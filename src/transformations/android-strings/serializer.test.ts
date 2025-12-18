import { describe, expect, it } from 'vitest';
import { mockDataset } from '../../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import type {
  SerializationResult,
  TranslationDataset,
} from '../../definitions';
import { serializeAndroidStrings } from './serializer';

describe('android strings serialization', () => {
  it('should serialize a simple Android Strings dataset', async () => {
    const options = mockSerializationOptions({
      locales: ['en_US', 'nl_NL'],
    });
    const dataset = mockDataset();

    const serialized = (await serializeAndroidStrings(dataset, options)) as
      | SerializationResult[]
      | undefined;
    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(2);
    expect(serialized).toEqual(
      expect.arrayContaining([
        {
          data: expect.anything(),
          filename: 'values-en/strings',
        },
        {
          data: expect.anything(),
          filename: 'values-nl/strings',
        },
      ])
    );
    expect(serialized?.[0]?.data).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="utf-8"?>
      <resources>
        <string name="first-entry">hello</string>
        <string name="second-entry">hello</string>
      </resources>
      "
    `);
    expect(serialized?.[1]?.data).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="utf-8"?>
      <resources>
        <string name="first-entry">world</string>
        <string name="second-entry">again</string>
      </resources>
      "
    `);
  });

  it('should serialize an android strings dataset with pluralization', async () => {
    const options = mockSerializationOptions({
      locales: ['en_US'],
      referenceLocale: 'en_US',
    });
    const input: TranslationDataset = {
      regular: {
        translations: {
          en_US: 'a regular string',
        },
      },
      strict: {
        plurals: {
          one: {
            en_US: 'one strict',
          },
        },
      },
    };

    const serialized = (await serializeAndroidStrings(input, options)) as
      | SerializationResult[]
      | undefined;
    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized?.[0].data).toContain('a regular string');
    expect(serialized?.[0].data).toContain('one strict');
    expect(serialized?.[0]).toMatchInlineSnapshot(`
      {
        "data": "<?xml version="1.0" encoding="utf-8"?>
      <resources>
        <string name="regular">a regular string</string>
        <plurals name="strict">
          <item quantity="one">one strict</item>
        </plurals>
      </resources>
      ",
        "filename": "values-en/strings",
      }
    `);
  });
});
