import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import { parsePoAggregated } from './po-parser';

describe('po parsing', () => {
  it('should parse PO files correctly', () => {
    const input = `msgid ""
        msgstr ""
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"

        msgid "first-entry"
        msgid_plural "hellos"
        msgstr[0] "hello"
        msgstr[1] ""

        msgid "second-entry"
        msgstr "hello"`;
    const parsed = parsePoAggregated({ en_US: input }, mockParsingOptions());

    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
        {
          "first-entry": {
            "description": undefined,
            "plurals": {
              "en_US": "hellos",
            },
            "tags": undefined,
            "translations": {
              "en_US": "hello",
            },
          },
          "second-entry": {
            "description": undefined,
            "tags": undefined,
            "translations": {
              "en_US": "hello",
            },
          },
        }
      `);
  });
});
