import { describe, expect, it } from 'vitest';
import { parseJson } from './parser';
import { mockParsingOptions } from '@/__testutils__';

describe('json parsing', () => {
  it('should parse a simple JSON dataset', () => {
    const dataset = `{
    "first-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "world"
    }
  },
  "second-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "again"
    }
  }
  }`;

    const parsed = parseJson(dataset, mockParsingOptions());
    expect(parsed).toBeDefined();
    expect(parsed).toEqual(
      expect.objectContaining({
        'first-entry': {
          translations: {
            en_US: 'hello',
            nl_NL: 'world',
          },
        },
        'second-entry': {
          translations: {
            en_US: 'hello',
            nl_NL: 'again',
          },
        },
      })
    );
  });
});
