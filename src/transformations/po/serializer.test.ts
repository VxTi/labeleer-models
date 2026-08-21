import { describe, expect, it } from 'vitest';
import { serializePo } from './serializer';
import { mockSerializationOptions } from '@/__testutils__';

describe('po serialization', () => {
  it('should serialize PO files correctly', () => {
    const serialized = serializePo(
      {
        regular: {
          translations: {
            en_US: 'hello world!',
          },
        },
        'something-plural': {
          translations: {},
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
          filename: 'en_US',
          data: expect.any(String),
        }),
      ])
    );
    expect(serialized[0]?.data).toMatchInlineSnapshot(`
      "msgid ""
      msgstr ""
      "Content-Type: text/plain; charset=utf-8\\n"
      "Content-Transfer-Encoding: 8bit\\n"
      "Language: en\\n"
      "Plural-Forms: nplurals=2; plural=(n != 1);\\n"

      msgid "regular"
      msgstr "hello world!"

      msgid "something-plural"
      msgid_plural "There are {count} items"
      msgstr[0] "There is one item"
      msgstr[1] "There are {count} items"
      "
    `);
  });
});
