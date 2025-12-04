import { describe, it, expect } from 'vitest';
import type { Locale }          from '../locales';
import { mockParsingOptions }   from './__testutils__/mock-parsing-options';
import { mockSerializationOptions } from './__testutils__/mock-serialization-options';
import {
  parseAppleStrings,
  parseAppleStringsAggregated,
  serializeAppleStrings,
} from './apple-strings';

describe('apple strings', () => {
  describe('parsing', () => {
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

  describe('serialization', () => {
    it('should serialize a dataset into apple strings', () => {
      const serialized = serializeAppleStrings(
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
        })
      );

      expect(serialized).toBeDefined();
      expect(Array.isArray(serialized)).toBeTruthy(); // We should output two files
      expect(serialized).toHaveLength(2);
      expect(serialized).toMatchInlineSnapshot(`
        [
          {
            "data": ""first-entry" = "english";
        "second-entry" = "english \\"second\\"";",
            "identifier": "en_US",
          },
          {
            "data": ""first-entry" = "dutch";
        "second-entry" = "dutch \\"second\\"";",
            "identifier": "nl_NL",
          },
        ]
      `);
    });
  });
});
