import { describe, expect, it } from 'vitest';
import { mockDataset } from './__testutils__/mock-dataset';
import { mockParsingOptions } from './__testutils__/mock-parsing-options';
import { mockSerializationOptions } from './__testutils__/mock-serialization-options';
import { parsePoAggregated, serializePo } from './po';

describe('po files', () => {
  describe('parsing', () => {
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
  describe('serialization', () => {
    it('should serialize PO files correctly', () => {
      const serialized = serializePo(mockDataset(), mockSerializationOptions());

      expect(serialized).toBeDefined();
      expect(serialized).toMatchInlineSnapshot(`
        [
          {
            "content": "msgid ""
        msgstr ""
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"

        msgid "first-entry"
        msgid_plural "hellos"
        msgstr[0] "hello"
        msgstr[1] ""

        msgid "second-entry"
        msgstr "hello"
        ",
            "identifier": "en_US",
          },
          {
            "content": "msgid ""
        msgstr ""
        "Content-Type: text/plain; charset=utf-8\\n"
        "Content-Transfer-Encoding: 8bit\\n"

        msgid "first-entry"
        msgid_plural "werelden"
        msgstr[0] "world"
        msgstr[1] ""

        msgid "second-entry"
        msgstr "again"
        ",
            "identifier": "nl_NL",
          },
        ]
      `);
    });
  });
});
