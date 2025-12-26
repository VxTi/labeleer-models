import { describe, it, expect } from 'vitest';
import { serializeXcstrings } from './serializer';
import { mockDataset, mockSerializationOptions } from '@/__testutils__';
import { DEFAULT_XCSTRINGS_FILE_NAME } from '@/transformations';

describe('xcstrings serialization', () => {
  it('should serialize a simple dataset into xcstrings', () => {
    const dataset = mockDataset({
      strict: {
        translations: {
          en_US: 'must exist',
        },
      },
      plural: {
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

    const result = serializeXcstrings(dataset, mockSerializationOptions());

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]?.filename).toEqual(DEFAULT_XCSTRINGS_FILE_NAME);
    expect(result[0]?.data).toContain('must exist');
    expect(result[0]?.data).toMatchInlineSnapshot(`
      "{
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
          "second-entry": {
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
                  "value": "again"
                }
              }
            }
          },
          "strict": {
            "comment": "",
            "extractionState": "manual",
            "localizations": {
              "en_US": {
                "stringUnit": {
                  "state": "translated",
                  "value": "must exist"
                }
              }
            }
          },
          "plural": {
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
      }"
    `);
  });
});
