import { mockParsingOptions, mockSerializationOptions } from '@/__testutils__';
import { type Locale, toBCP47 } from '@/locales';
import { AppleStringsDatasetTransformer } from '@/transformations/apple-strings-transformer';
import { describe, expect, it } from 'vitest';

const transformer = AppleStringsDatasetTransformer;

describe('apple strings parsing', () => {
  it('should aggregate several apple strings datasets', () => {
    const inputs: Partial<Record<Locale, string>> = {
      en_US: `
"first-entry" = "english";
"second-entry" = "english \\"second\\"";`,
      nl_NL: `
"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`,
    };

    const aggregated = transformer.parseAggregate(inputs, mockParsingOptions());

    expect(aggregated).toBeDefined();
    expect(aggregated).toMatchObject({
      'first-entry': {
        translations: expect.objectContaining({
          en_US: 'english',
          nl_NL: 'dutch',
        }),
      },
      'second-entry': {
        translations: expect.objectContaining({
          en_US: 'english "second"',
          nl_NL: 'dutch "second"',
        }),
      },
    });
    expect(aggregated).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "plurals": {},
          "translations": {
            "en_US": "english",
            "nl_NL": "dutch",
          },
        },
        "second-entry": {
          "plurals": {},
          "translations": {
            "en_US": "english "second"",
            "nl_NL": "dutch "second"",
          },
        },
      }
    `);
  });

  it('should parse a simple apple strings dataset', () => {
    const input = `
"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`;
    const parsed = transformer.parse(
      input,
      mockParsingOptions({ targetLocale: 'en_US' })
    );

    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "plurals": {},
          "translations": {
            "en_US": "dutch",
          },
        },
        "second-entry": {
          "plurals": {},
          "translations": {
            "en_US": "dutch "second"",
          },
        },
      }
    `);
  });

  it('should throw an error when no locale is provided', () => {
    const input = `
"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`;
    expect(() =>
      transformer.parse(input, mockParsingOptions({ targetLocale: undefined }))
    ).toThrowError('Locale is required for parsing Apple .strings files.');
  });

  it('should skip comments and invalid lines', () => {
    const input = `
// This is a comment
"valid-entry" = "value";
// Another comment
invalid line
"another-valid-entry" = "another value";`;
    const parsed = transformer.parse(
      input,
      mockParsingOptions({ targetLocale: 'en_US' })
    );

    expect(parsed).toMatchInlineSnapshot(`
      {
        "another-valid-entry": {
          "plurals": {},
          "translations": {
            "en_US": "another value",
          },
        },
        "valid-entry": {
          "plurals": {},
          "translations": {
            "en_US": "value",
          },
        },
      }
    `);
  });
});

describe('apple strings serialization', () => {
  it('should serialize a dataset into apple strings', () => {
    const serialized = transformer.serialize(
      {
        'first-entry': {
          translations: {
            nl_NL: 'dutch',
            en_US: 'english',
          },
        },
        'second-entry': {
          translations: {
            en_US: 'english "second"',
            nl_NL: 'dutch "second"',
          },
        },
      },
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US', 'nl_NL'],
        keylessTranslation: false,
      })
    );

    expect(Object.keys(serialized)).toHaveLength(2);
    expect(serialized).toHaveProperty('en-US.strings');
    expect(serialized).toHaveProperty('nl-NL.strings');

    expect(serialized['en-US.strings'].content).toMatchInlineSnapshot(`
      ""first-entry" = "english";
      "second-entry" = "english \\"second\\"";"
    `);
    expect(serialized['nl-NL.strings'].content).toMatchInlineSnapshot(`
      ""first-entry" = "dutch";
      "second-entry" = "dutch \\"second\\"";"
    `);
  });

  it('should escape special characters', () => {
    const refLang = 'en_US';
    const serialized = transformer.serialize(
      {
        'special-entry': {
          translations: {
            [refLang]: 'Line1\nLine2\tTabbed\\"Quote\\"',
          },
        },
      },
      mockSerializationOptions({
        referenceLocale: refLang,
        locales: [refLang],
        keylessTranslation: false,
      })
    );

    const fileName = `${toBCP47(refLang)}.strings`;

    expect(serialized).toBeDefined();
    expect(serialized).toHaveProperty(fileName);
    expect(serialized[fileName].content).toMatchInlineSnapshot(
      `""special-entry" = "Line1\\nLine2\\tTabbed\\\\\\"Quote\\\\\\"";"`
    );
  });
});
