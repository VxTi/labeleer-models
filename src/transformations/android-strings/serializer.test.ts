import { describe, expect, it } from 'vitest';
import { serializeAndroidStrings } from './serializer';
import { mockDataset, mockSerializationOptions } from '@/__testutils__';
import type { SerializationResult, TranslationDataset } from '@/definitions';

describe('android strings serialization', () => {
  it('should serialize a simple Android Strings dataset', () => {
    const options = mockSerializationOptions({
      locales: ['en_US', 'nl_NL'],
    });
    const dataset = mockDataset();

    const serialized = serializeAndroidStrings(dataset, options) as
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

  it('should serialize an android strings dataset with pluralization', () => {
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
        translations: {},
        plurals: {
          one: {
            en_US: 'one strict',
          },
        },
      },
    };

    const serialized = serializeAndroidStrings(input, options) as
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

  it('escapes Android special characters (apostrophe, quote, backslash)', () => {
    const input: TranslationDataset = {
      greeting: {
        translations: { en_US: `it's a "quote" with a \\ backslash` },
        plurals: {},
      },
    };

    const serialized = serializeAndroidStrings(
      input,
      mockSerializationOptions({ locales: ['en_US'], referenceLocale: 'en_US' })
    );

    // The backslash escape guards Android's parser; the XML builder then
    // entity-encodes the quote/apostrophe. aapt XML-decodes `\&apos;` back to
    // `\'` (Android-safe) — a bare `&apos;` would decode to an unescaped `'`.
    const data = serialized[0]?.data ?? '';
    expect(data).toContain('it\\&apos;s');
    expect(data).toContain('\\&quot;quote\\&quot;');
    expect(data).toContain('\\\\ backslash');
  });

  it('adds region qualifiers when locales share a language', () => {
    const serialized = serializeAndroidStrings(
      mockDataset(),
      mockSerializationOptions({
        locales: ['en_US', 'en_GB'],
        referenceLocale: 'en_US',
      })
    );

    const filenames = serialized.map(fragment => fragment.filename).sort();
    expect(filenames).toEqual([
      'values-en-rGB/strings',
      'values-en-rUS/strings',
    ]);
  });
});
