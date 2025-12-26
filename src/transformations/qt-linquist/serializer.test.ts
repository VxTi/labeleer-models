import { describe, expect, it } from 'vitest';
import { serializeTs } from './serializer';
import { mockDataset, mockSerializationOptions } from '@/__testutils__';

describe('serialization', () => {
  it('should serialize a simple Qt Linguist XML dataset', () => {
    const dataset = mockDataset();
    const options = mockSerializationOptions({
      locales: ['en_US', 'nl_NL', 'en_AU'],
      referenceLocale: 'en_US',
    });

    const serialized = serializeTs(dataset, options);

    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(2);
    expect(serialized).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'nl-NL',
        }),
        expect.objectContaining({
          filename: 'en-AU',
        }),
      ])
    );
    expect(serialized).toMatchInlineSnapshot(`
        [
          {
            "data": "<?xml version="1.0" encoding="utf-8"?>
        <TS version="2.1" language="en-US">
          <context>
            <name>Labeleer Translations</name>
            <message key="first-entry">
              <source>hello</source>
              <translation>world</translation>
            </message>
            <message key="second-entry">
              <source>hello</source>
              <translation>again</translation>
            </message>
          </context>
        </TS>
        ",
            "filename": "nl-NL",
          },
          {
            "data": "<?xml version="1.0" encoding="utf-8"?>
        <TS version="2.1" language="en-US">
          <context>
            <name>Labeleer Translations</name>
            <message key="first-entry">
              <source>hello</source>
              <translation></translation>
            </message>
            <message key="second-entry">
              <source>hello</source>
              <translation></translation>
            </message>
          </context>
        </TS>
        ",
            "filename": "en-AU",
          },
        ]
      `);
  });

  it('should serialize a Qt dataset even if there is just a single locale', () => {
    const dataset = mockDataset();
    const options = mockSerializationOptions({
      locales: ['en_US'],
      referenceLocale: 'en_US',
    });

    const serialized = serializeTs(dataset, options);

    expect(serialized).toBeDefined();
    expect(serialized).toHaveLength(1);
    expect(serialized[0]).toMatchInlineSnapshot(`
        {
          "data": "<?xml version="1.0" encoding="utf-8"?>
        <TS version="2.1" language="en-US">
          <context>
            <name>Labeleer Translations</name>
            <message key="first-entry">
              <source>hello</source>
            </message>
            <message key="second-entry">
              <source>hello</source>
            </message>
          </context>
        </TS>
        ",
          "filename": "en-US",
        }
      `);
  });
});
