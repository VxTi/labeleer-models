import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { datasetParser } from '../../decoders';
import type { ParserFn, SerializerFn } from '../../types';

export const parseXml: ParserFn = input => {
  try {
    const parser = new XMLParser();
    const xmlObj: unknown = parser.parse(input);

    const decoded = datasetParser.safeParse(xmlObj);

    return decoded.success ? decoded.data : undefined;
  } catch (e) {
    console.error('Something went wrong whilst attempting to parse XML: ', e);
    return undefined;
  }
};

export const serializeXml: SerializerFn = input => {
  try {
    const builder = new XMLBuilder({ format: true });

    return builder.build(input);
  } catch (e) {
    console.error(
      'Something went wrong whilst attempting to serialize XML: ',
      e
    );
    return undefined;
  }
};
