import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializeXliff } from './xliff-serializer';
import { describe, expect, it } from 'vitest';

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
          "data": "<?xml version="1.0" encoding="UTF-8"?>
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
          "data": "<?xml version="1.0" encoding="UTF-8"?>
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
          "data": "<?xml version="1.0" encoding="UTF-8"?>
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
