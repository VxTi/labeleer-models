import { describe, expect, it } from 'vitest';
import { parseXcstrings } from './parser';
import { mockParsingOptions } from '@/__testutils__';
import { Plurality } from '@/definitions';

describe('xcstrings parsing', () => {
  it('should parse a simple xcstrings file', () => {
    const dataset = `{
        "sourceLanguage": "en_US",
        "strings": {
          "first-entry": {
            "comment": "",
            "extractionState": "manual",
            "localizations": {
              "en_US": {
                "stringUnit": {
                  "state": "translated",
                  "value": "hello"
                }
              },
              "nl_NL": {
                "stringUnit": {
                  "state": "translated",
                  "value": "world"
                }
              }
            }
          },
          "plural-entry": {
            "comment": "",
            "extractionState": "manual",
            "localizations": {
              "en_US": {
                "variations": {
                  "plural": {
                    "one": {
                      "stringUnit": {
                        "state": "translated",
                        "value": "hello"
                      }
                    },
                    "other": {
                      "stringUnit": {
                        "state": "translated",
                        "value": "hello"
                      }
                    }
                  }
                }
              },
              "nl_NL": {
                "variations": {
                  "plural": {
                    "one": {
                      "stringUnit": {
                        "state": "translated",
                        "value": "world"
                      }
                    },
                    "other": {
                      "stringUnit": {
                        "state": "translated",
                        "value": "again"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "version": "1.0"
      }`;
    const parsed = parseXcstrings(dataset, mockParsingOptions());
    expect(parsed).toMatchObject({
      'first-entry': {
        translations: {
          en_US: 'hello',
          nl_NL: 'world',
        },
      },
      'plural-entry': {
        plurals: {
          [Plurality.ONE]: {
            en_US: 'hello',
            nl_NL: 'world',
          },
          [Plurality.OTHER]: {
            en_US: 'hello',
            nl_NL: 'again',
          },
        },
      },
    });
  });
});
