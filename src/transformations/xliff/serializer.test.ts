import { describe, expect, it } from 'vitest';
import { mockDataset } from '../../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../../__testutils__/mock-serialization-options';
import { serializeXliff } from './serializer';

describe('XLIFF 2.1 Serialization', () => {
  it('serializes dataset for a single locale (reference only)', async () => {
    const result = await serializeXliff(
      mockDataset({
        strict: { translations: { en_US: 'must exist' } },
      }),
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US'],
      })
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]?.data).toContain('must exist');
    expect(result[0]?.data).toMatchInlineSnapshot(`
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
          <unit id="strict">
            <segment>
              <source>must exist</source>
            </segment>
          </unit>
        </file>
      </xliff>
      "
    `);
  });

  it('serializes dataset with source and target languages', async () => {
    const result = await serializeXliff(
      mockDataset(),
      mockSerializationOptions({
        referenceLocale: 'en_US',
        locales: ['en_US', 'de_DE'],
      })
    );

    expect(result).toBeDefined();
    expect(result).toHaveLength(1);
    expect(result[0]?.data).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
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
      "
    `);
  });

  it('serializes multiple locale fragments', async () => {
    const dataset = mockDataset();

    const result = await serializeXliff(dataset, {
      referenceLocale: 'en_US',
      locales: ['en_US', 'fr_FR', 'es_ES'],
    });

    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ filename: 'fr_FR' }),
        expect.objectContaining({ filename: 'es_ES' }),
      ])
    );
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
          "filename": "fr_FR",
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
          "filename": "es_ES",
        },
      ]
    `);
  });
});
