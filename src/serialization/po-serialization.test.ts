import { describe, expect, it } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializePo } from './po-serialization';

describe('po serialization', () => {
  it('should serialize PO files correctly', () => {
    const serialized = serializePo(mockDataset(), mockSerializationOptions());

    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
        [
          {
            "data": "msgid ""
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
            "data": "msgid ""
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
