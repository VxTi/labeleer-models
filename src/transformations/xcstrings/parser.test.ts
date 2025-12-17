import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '../../__testutils__/mock-parsing-options';
import { parseXcstrings } from './parser';

describe('xcstrings parsing', () => {
  it('should parse a simple xcstrings file', async () => {
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
    const parsed = await parseXcstrings(dataset, mockParsingOptions());
    expect(parsed).toEqual({
      'first-entry': {
        translations: {
          en_US: 'hello',
          nl_NL: 'world',
        },
      },
      'plural-entry': {
        plurals: {
          one: {
            en_US: 'hello',
            nl_NL: 'world',
          },
          other: {
            en_US: 'hello',
            nl_NL: 'again',
          },
        },
      },
    });
  });
});
