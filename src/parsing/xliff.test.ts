import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import { parseXliff } from './xliff';
import { describe, expect, it } from 'vitest';

describe('XLIFF 2.1 Parsing', () => {
  it('parses a minimal XLIFF 2.1 document', () => {
    const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en" trgLang="de">
        <file id="f1">
          <unit id="hello">
            <segment>
              <source>Hello</source>
              <target>Hallo</target>
            </segment>
          </unit>
        </file>
      </xliff>
    `;

    const result = parseXliff(xml, mockParsingOptions());

    expect(result).toMatchInlineSnapshot(`
      {
        "hello": {
          "translations": {
            "de_DE": "Hallo",
            "en_GB": "Hello",
          },
        },
      }
    `);
  });

  it('parses XLIFF 2.1 without target language', () => {
    const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en">
        <file id="f1">
          <unit id="greeting">
            <segment>
              <source>Hello world</source>
            </segment>
          </unit>
        </file>
      </xliff>
    `;

    const result = parseXliff(xml, mockParsingOptions());

    expect(result).toMatchInlineSnapshot(`
      {
        "greeting": {
          "translations": {
            "en_GB": "Hello world",
          },
        },
      }
    `);
  });
});
