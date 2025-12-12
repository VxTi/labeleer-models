import { describe, expect, it } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { serializeTs } from './qt-linquist-serializer';

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
          identifier: 'nl-NL',
        }),
        expect.objectContaining({
          identifier: 'en-AU',
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
            "identifier": "nl-NL",
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
            "identifier": "en-AU",
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
    expect(serialized?.[0]).toMatchInlineSnapshot(`
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
          "identifier": "en-US",
        }
      `);
  });
});
