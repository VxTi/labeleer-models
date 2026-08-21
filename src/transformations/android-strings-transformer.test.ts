import {
  mockDataset,
  mockParsingOptions,
  mockSerializationOptions,
} from '@/__testutils__';
import { type TranslationDataset } from '@/definitions';
import { AndroidStringsDatasetTransformer } from './android-strings-transformer';
import { describe, expect, it } from 'vitest';

const transformer = new AndroidStringsDatasetTransformer();

describe('android strings serialization', () => {
  it('should serialize a simple Android Strings dataset', () => {
    const options = mockSerializationOptions({
      locales: ['en_US', 'nl_NL'],
    });
    const dataset = mockDataset();

    const serialized = transformer.serialize(dataset, options);

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
    expect(serialized[0]?.data).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="utf-8"?>
      <resources>
        <string name="first-entry">hello</string>
        <string name="second-entry">hello</string>
      </resources>
      "
    `);
    expect(serialized[1]?.data).toMatchInlineSnapshot(`
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

    const serialized = transformer.serialize(input, options);
    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized[0].data).toContain('a regular string');
    expect(serialized[0].data).toContain('one strict');
    expect(serialized[0]).toMatchInlineSnapshot(`
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

    const serialized = transformer.serialize(
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
    const serialized = transformer.serialize(
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

describe('android strings parsing', () => {
  it('should parse a simple android strings XML dataset', () => {
    const input = `<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="first-label">Hello</string>
          <string name="second-label">again</string>
        </resources>`;

    const parsed = transformer.parse(input, {
      referenceLocale: 'en_US',
    });
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-label": {
          "plurals": {},
          "translations": {
            "en_US": "Hello",
          },
        },
        "second-label": {
          "plurals": {},
          "translations": {
            "en_US": "again",
          },
        },
      }
    `);
  });

  it('should parse an android dataset with plurals', () => {
    const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="first-label">Hello</string>
  <string name="second-label">again</string>
  <plurals name="plural-label">
    <item quantity="zero">Zero</item>
    <item quantity="one">One item</item>
    <item quantity="two">Two</item>
    <item quantity="other">Many items</item>
  </plurals>
</resources>`;

    const parsed = transformer.parse(
      input,
      mockParsingOptions({
        referenceLocale: 'en_US',
      })
    );
    expect(parsed).toBeDefined();
    expect(parsed).toEqual(
      expect.objectContaining({
        'plural-label': expect.objectContaining({
          plurals: expect.objectContaining({
            one: expect.objectContaining({
              en_US: 'One item',
            }),
            other: expect.objectContaining({
              en_US: 'Many items',
            }),
            two: expect.objectContaining({
              en_US: 'Two',
            }),
            zero: expect.objectContaining({
              en_US: 'Zero',
            }),
          }),
        }),
      })
    );
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-label": {
          "plurals": {},
          "translations": {
            "en_US": "Hello",
          },
        },
        "plural-label": {
          "plurals": {
            "one": {
              "en_US": "One item",
            },
            "other": {
              "en_US": "Many items",
            },
            "two": {
              "en_US": "Two",
            },
            "zero": {
              "en_US": "Zero",
            },
          },
          "translations": {},
        },
        "second-label": {
          "plurals": {},
          "translations": {
            "en_US": "again",
          },
        },
      }
    `);
  });

  it('should throw an error for invalid XML', () => {
    const input = `<resources>
  <string name="first-label">Hello</string>
  <string name="second-label">again</string>
  <plurals name="plural-label">
    <item quantity="zero">Zero</item>
    <item quantity="one">One item</item>
    <item quantity="two">Two</item>
    <item quantity="other">Many items</item>
</plur
`;

    expect(() =>
      transformer.parse(input, { referenceLocale: 'en_US' })
    ).toThrowError(
      'Failed to parse Android Strings XML: Error: Closing Tag is not closed.'
    );
  });
});
