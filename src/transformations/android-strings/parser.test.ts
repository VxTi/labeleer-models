import { describe, expect, it } from 'vitest';
import { mockParsingOptions } from '../../__testutils__/mock-parsing-options';
import { parseAndroidStrings } from './parser';

describe('android strings parsing', () => {
  it('should parse a simple android strings XML dataset', async () => {
    const input = `<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="first-label">Hello</string>
          <string name="second-label">again</string>
        </resources>`;

    const parsed = await parseAndroidStrings(input, {
      referenceLocale: 'en_US',
    });
    expect(parsed).toBeDefined();
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-label": {
          "translations": {
            "en_US": "Hello",
          },
        },
        "second-label": {
          "translations": {
            "en_US": "again",
          },
        },
      }
    `);
  });

  it('should parse an android dataset with plurals', async () => {
    const input = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="first-label">Hello</string>
  <string name="second-label">again</string>
  <plurals name="plural-label">
    <item quantity="zero">Zero</item>
    <item quantity="one">One item</item>
    <item quantity="two">Two</item>
    <item quantity="other">Many items</item>
  </plurals>
</resources>`;

    const parsed = await parseAndroidStrings(
      input,
      mockParsingOptions({
        referenceLocale: 'en_US',
      })
    );
    expect(parsed).toBeDefined();
    expect(parsed['plural-label']?.['plurals']?.['one']?.['en_US']).toBe(
      'One item'
    );
    expect(parsed).toMatchInlineSnapshot(`
      {
        "first-label": {
          "translations": {
            "en_US": "Hello",
          },
        },
        "plural-label": {
          "plurals": {
            "one": {
              "en_US": "One item",
            },
            "other": {
              "en_US": "Many items",
            },
            "two": {
              "en_US": "Two",
            },
            "zero": {
              "en_US": "Zero",
            },
          },
          "translations": {},
        },
        "second-label": {
          "translations": {
            "en_US": "again",
          },
        },
      }
    `);
  });
});
