import { describe, expect, it } from 'vitest';
import { serializeAppleStrings } from './serializer';
import { mockSerializationOptions } from '@/__testutils__';

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
        keylessTranslation: false,
      })
    );

    expect(serialized).toBeDefined();
    expect(Array.isArray(serialized)).toBeTruthy(); // We should output two files
    expect(serialized).toHaveLength(2);
    expect(serialized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'en-US',
          data: `"first-entry" = "english";
"second-entry" = "english \\"second\\"";`,
        }),
        expect.objectContaining({
          filename: 'nl-NL',
          data: `"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`,
        }),
      ])
    );
  });

  it('should escape special characters', () => {
    const serialized = serializeAppleStrings(
      {
        'special-entry': {
          translations: {
            en_US: 'Line1\nLine2\tTabbed\\"Quote\\"',
          },
        },
      },
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US'],
        keylessTranslation: false,
      })
    );

    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized[0]).toEqual(
      expect.objectContaining({
        filename: 'en-US',
        data: `"special-entry" = "Line1\\nLine2\\tTabbed\\\\\\"Quote\\\\\\"";`,
      })
    );
  });
});
