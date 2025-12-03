import { describe, it, expect } from 'vitest';
import { mockDataset } from '../__testutils__/mock-dataset';
import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import { mockSerializationOptions } from '../__testutils__/mock-serialization-options';
import { parseTs, serializeTs } from './qt-linguist';

describe('qt-linguist', () => {
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
            "content": "<?xml version="1.0" encoding="utf-8"?>
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
            "content": "<?xml version="1.0" encoding="utf-8"?>
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
          "content": "<?xml version="1.0" encoding="utf-8"?>
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

  describe('parsing', () => {
    it('should parse a simple Qt Linguist XML dataset', () => {
      const dataset = `<?xml version="1.0" encoding="utf-8"?>
        <TS version="2.1" language="nl-NL">
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
        </TS>`;

      const parsed = parseTs(
        dataset,
        mockParsingOptions({ referenceLocale: 'en_US' })
      );
      expect(parsed).toBeDefined();
      expect(parsed).toMatchInlineSnapshot(`
        {
          "first-entry": {
            "translations": {
              "en_US": "hello",
              "nl_NL": "world",
            },
          },
          "second-entry": {
            "translations": {
              "en_US": "hello",
              "nl_NL": "again",
            },
          },
        }
      `);
    });

    it('should parse a TS set even if there are no translations other than the reference', () => {
      const dataset = `<?xml version="1.0" encoding="utf-8"?>
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
        </TS>`;
      const parsed = parseTs(dataset, mockParsingOptions());

      expect(parsed).toBeDefined();
      expect(parsed).toMatchInlineSnapshot(`
        {
          "first-entry": {
            "translations": {
              "en_US": "",
            },
          },
          "second-entry": {
            "translations": {
              "en_US": "",
            },
          },
        }
      `);
    });
  });
});
