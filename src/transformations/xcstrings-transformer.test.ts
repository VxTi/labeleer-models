import {
  mockDataset,
  mockParsingOptions,
  mockSerializationOptions,
} from '@/__testutils__';
import { Plurality } from '@/definitions';
import XCStringsDatasetTransformer, {
  DEFAULT_XCSTRINGS_FILE_NAME,
} from '@/transformations/xcstrings-transformer';
import { expect, it, describe } from 'vitest';

const transformer = new XCStringsDatasetTransformer();

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
    const parsed = transformer.parse(dataset, mockParsingOptions());
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

describe('xcstrings serialization', () => {
  it('should serialize a simple dataset into xcstrings', () => {
    const dataset = mockDataset({
      strict: {
        translations: {
          en_US: 'must exist',
        },
      },
      plural: {
        translations: {},
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

    const result = transformer.serialize(dataset, mockSerializationOptions());

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]?.filename).toEqual(DEFAULT_XCSTRINGS_FILE_NAME);
    expect(result[0]?.data).toContain('must exist');
    expect(result[0]?.data).toMatchInlineSnapshot(`
      "{
        "sourceLanguage": "en-US",
        "strings": {
          "first-entry": {
            "comment": "",
            "extractionState": "manual",
            "localizations": {
              "en-US": {
                "stringUnit": {
                  "state": "translated",
                  "value": "hello"
                }
              },
              "nl-NL": {
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
              "en-US": {
                "stringUnit": {
                  "state": "translated",
                  "value": "hello"
                }
              },
              "nl-NL": {
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
              "en-US": {
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
              "en-US": {
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
              "nl-NL": {
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
