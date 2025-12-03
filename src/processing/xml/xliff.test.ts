import { describe, it, expect } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { parseXliff, serializeXliff } from './xliff';

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

    const result = parseXliff(xml, 'de_DE');

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

    const result = parseXliff(xml, 'fr_FR');

    expect(result).toMatchInlineSnapshot(`
      {
        "greeting": {
          "translations": {
            "en_GB": "Hello world",
            "fr_FR": "",
          },
        },
      }
    `);
  });
});

describe('XLIFF 2.1 Serialization', () => {
  it('serializes dataset for a single locale (reference only)', () => {
    const result = serializeXliff(
      mockDataset(),
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US'],
      })
    );

    expect(result).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en">
        <file id="f1">
          <unit id="first-entry">
            <segment>
              <source>hello</source>
            </segment>
          </unit>
          <unit id="second-entry">
            <segment>
              <source>hello</source>
            </segment>
          </unit>
        </file>
      </xliff>
      "
    `);
  });

  it('serializes dataset with source and target languages', () => {
    const result = serializeXliff(
      mockDataset(),
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US', 'de_DE'],
      })
    );

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "content": "<?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en" trgLang="de">
        <file id="f1">
          <unit id="first-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
          <unit id="second-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
        </file>
      </xliff>
      ",
          "identifier": "de_DE",
        },
      ]
    `);
  });

  it('serializes multiple locale fragments', () => {
    const dataset = mockDataset();

    const result = serializeXliff(dataset, {
      referenceLocale: 'en_US',
      locales: ['en_US', 'fr_FR', 'es_ES'],
    });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "content": "<?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en" trgLang="fr">
        <file id="f1">
          <unit id="first-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
          <unit id="second-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
        </file>
      </xliff>
      ",
          "identifier": "fr_FR",
        },
        {
          "content": "<?xml version="1.0" encoding="UTF-8"?>
      <xliff version="2.1" xmlns="urn:oasis:names:tc:xliff:document:2.1" srcLang="en" trgLang="es">
        <file id="f1">
          <unit id="first-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
          <unit id="second-entry">
            <segment>
              <source>hello</source>
              <target/>
            </segment>
          </unit>
        </file>
      </xliff>
      ",
          "identifier": "es_ES",
        },
      ]
    `);
  });
});
