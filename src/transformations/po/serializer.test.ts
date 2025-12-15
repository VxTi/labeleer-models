import { describe, expect, it } from 'vitest';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import { serializePo } from './serializer';

describe('po serialization', () => {
  it('should serialize PO files correctly', async () => {
    const serialized = await serializePo(
      {
        regular: {
          translations: {
            en_US: 'hello world!',
          },
        },
        'something-plural': {
          plurals: {
            zero: {
              en_US: 'There are no items',
            },
            one: {
              en_US: 'There is one item',
            },
            other: {
              en_US: 'There are {count} items',
            },
          },
        },
      },
      mockSerializationOptions({
        locales: ['en_US'],
        referenceLocale: 'en_US',
      })
    );

    expect(serialized).toBeDefined();
    expect(serialized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          identifier: 'en_US',
          data: expect.any(String),
        }),
      ])
    );
    expect(serialized[0]?.data).toMatchInlineSnapshot(`
      "msgid ""
      msgstr ""
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"

      msgid "regular"
      msgstr "hello world!"

      msgid "something-plural"
      msgid_plural "There are {count} items"
      msgstr[0] "There are no items"
      msgstr[1] "There is one item"
      "
    `);
  });
});
