import { describe, it, expect } from 'vitest';
import { parseAppleStrings, parseAppleStringsAggregated } from './parser';
import { mockParsingOptions } from '@/__testutils__';
import { type Locale } from '@/locales';

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

    const aggregated = parseAppleStringsAggregated(
      inputs,
      mockParsingOptions()
    );

    expect(aggregated).toBeDefined();
    expect(aggregated).toEqual(
      expect.objectContaining({
        'first-entry': {
          translations: expect.objectContaining({
            en_US: 'english',
            nl_NL: 'dutch',
          }),
        },
        'second-entry': {
          translations: expect.objectContaining({
            en_US: 'english \\"second\\"',
            nl_NL: 'dutch \\"second\\"',
          }),
        },
      })
    );
    expect(aggregated).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "translations": {
            "en_US": "english",
            "nl_NL": "dutch",
          },
        },
        "second-entry": {
          "translations": {
            "en_US": "english \\"second\\"",
            "nl_NL": "dutch \\"second\\"",
          },
        },
      }
    `);
  });

  it('should parse a simple apple strings dataset', () => {
    const input = `
"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`;
    const parsed = parseAppleStrings(
      input,
      mockParsingOptions({ targetLocale: 'en_US' })
    );

    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "translations": {
            "en_US": "dutch",
          },
        },
        "second-entry": {
          "translations": {
            "en_US": "dutch \\"second\\"",
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
      parseAppleStrings(input, mockParsingOptions({ targetLocale: undefined }))
    ).toThrowError('Locale is required for parsing Apple .strings files.');
  });

  it('should skip comments and invalid lines', () => {
    const input = `
// This is a comment
"valid-entry" = "value";
// Another comment
invalid line
"another-valid-entry" = "another value";`;
    const parsed = parseAppleStrings(
      input,
      mockParsingOptions({ targetLocale: 'en_US' })
    );

    expect(parsed).toMatchInlineSnapshot(`
      {
        "another-valid-entry": {
          "translations": {
            "en_US": "another value",
          },
        },
        "valid-entry": {
          "translations": {
            "en_US": "value",
          },
        },
      }
    `);
  });
});
