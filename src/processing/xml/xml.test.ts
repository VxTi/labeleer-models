import { describe, it, expect } from 'vitest';
import { mockDataset }          from '../__testutils__/mock-dataset';
import { serializeXml }         from './xml';

describe('xml parsing', () => {
  it('should parse a simple XML dataset', () => {
    const xmlInput = `
    <?xml version="1.0" encoding="UTF-8"?>
    
    `;
  });
});

describe('xml serialization', () => {
  it('should serialize a simple XML dataset', () => {
    const dataset = mockDataset();

    const serialized = serializeXml(dataset);
    expect(serialized).toBeDefined();
    expect(serialized).toMatchInlineSnapshot(`
      "<first-entry>
        <translations>
          <en_US>hello</en_US>
          <nl_NL>world</nl_NL>
        </translations>
      </first-entry>
      <second-entry>
        <translations>
          <en_US>hello</en_US>
          <nl_NL>again</nl_NL>
        </translations>
      </second-entry>
      "
    `);
  });
});
