import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '../__testutils__/mock-parsing-options';
import { parseTs } from './qt-linquist-parser';

describe('qt linquist parsing', () => {
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
