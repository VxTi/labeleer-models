import { describe, it, expect } from 'vitest';
import { type Locale } from '../locales';
import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import {
  parseAppleStrings,
  parseAppleStringsAggregated,
} from './apple-strings-parser';

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
});
