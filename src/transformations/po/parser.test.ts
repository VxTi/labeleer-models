import { describe, expect, it } from 'vitest';
import { parsePoAggregated } from './parser';
import { mockParsingOptions } from '@/__testutils__';

describe('po parsing', () => {
  it('should parse PO files correctly', () => {
    const input = `msgid ""
        msgstr ""
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"

        msgid "first-entry"
        msgid_plural "first-entry-plural"
        msgstr[0] "0 hellos"
        msgstr[1] "1 hello"
        msgstr[2] "2 hellos"

        msgid "second-entry"
        msgstr "hello"`;
    const parsed = parsePoAggregated({ en_US: input }, mockParsingOptions());

    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-entry": {
          "plurals": {
            "one": {
              "en_US": "0 hellos",
            },
            "other": {
              "en_US": "1 hello",
            },
            "two": {
              "en_US": "2 hellos",
            },
          },
          "translations": {},
        },
        "second-entry": {
          "plurals": {},
          "translations": {
            "en_US": "hello",
          },
        },
      }
    `);
  });
});
