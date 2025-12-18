import { describe, expect, it } from 'vitest';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import {
  type AppleStringsSerializationOptions,
  serializeAppleStrings,
} from './serializer';

describe('apple strings serialization', () => {
  it('should serialize a dataset into apple strings', async () => {
    const serialized = await serializeAppleStrings(
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
        translateDirect: false,
      })
    );

    expect(serialized).toBeDefined();
    expect(Array.isArray(serialized)).toBeTruthy(); // We should output two files
    expect(serialized).toHaveLength(2);
    expect(serialized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'en_US',
          data: `"first-entry" = "english";
"second-entry" = "english \\"second\\"";`,
        }),
        expect.objectContaining({
          filename: 'nl_NL',
          data: `"first-entry" = "dutch";
"second-entry" = "dutch \\"second\\"";`,
        }),
      ])
    );
  });

  it('should escape special characters', async () => {
    const serialized = await serializeAppleStrings(
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
        translateDirect: false,
      })
    );

    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized[0]).toEqual(
      expect.objectContaining({
        filename: 'en_US',
        data: `"special-entry" = "Line1\\nLine2\\tTabbed\\\\"Quote\\\\"";`,
      })
    );
  });

  it('should throw an error when no reference locale is set', () => {
    expect(() =>
      serializeAppleStrings(
        {
          'some-entry': {
            translations: {
              en_US: 'english',
            },
          },
        },
        mockSerializationOptions<AppleStringsSerializationOptions>({
          referenceLocale: undefined,
          translateDirect: true,
        })
      )
    ).toThrowError('No reference locale set for key "some-entry"');
  });
});
