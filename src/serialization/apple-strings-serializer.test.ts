import { describe, expect, it } from 'vitest';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializeAppleStrings } from './apple-strings-serializer';

describe('apple strings serialization', () => {
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
