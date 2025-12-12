import { describe, expect, it } from 'vitest';
import { parseAndroidStrings } from './android-strings';

describe('android strings parsing', () => {
  it('should parse a simple android strings XML dataset', () => {
    const input = `<?xml version="1.0" encoding="utf-8"?>
        <resources>
          <string name="first-label">Hello</string>
          <string name="second-label">again</string>
        </resources>`;

    const parsed = parseAndroidStrings(input, { referenceLocale: 'en_US' });
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
});
