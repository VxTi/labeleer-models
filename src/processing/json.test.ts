import type { TranslationDataset } from '@labeleer/models';
import { parseJson, serializeJson } from './json';
import { expect, describe, it } from 'vitest';

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

    const parsed = parseJson(dataset);
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "world",
          },
        },
        "second-entry": {
          "translations": {
            "en_US": "hello",
            "nl_NL": "again",
          },
        },
      }
    `);
  });
});

describe('json serialization', () => {
  it('should serialize a simple JSON dataset', () => {
    const dataset: TranslationDataset = {
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
    };

    const serialized = serializeJson(dataset);
    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      [
        {
          "content": "{
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
      }",
        },
      ]
    `);
  });
});
