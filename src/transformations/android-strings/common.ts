import { z } from 'zod';
import { Plurality } from '@/definitions';

const ASXmlSingularEntryDecoder = z.object({
  '#text': z.string(),
  '@_name': z.string(),
});

export type ASXmlSingularEntry = z.infer<typeof ASXmlSingularEntryDecoder>;

export const ASXmlPluralEntryDecoder = z.object({
  '@_quantity': z.enum(Plurality),
  '#text': z.string(),
});

export type ASXmlPluralEntry = z.infer<typeof ASXmlPluralEntryDecoder>;

export const ASXmlPluralListDecoder = z.object({
  '@_name': z.string(),
  item: z.array(ASXmlPluralEntryDecoder),
});

export type ASXmlPluralList = z.infer<typeof ASXmlPluralListDecoder>;

export const ASXmlDecoder = z.object({
  resources: z.object({
    // When the user only has a single resource entry, fast-xml-parser
    // will parse it as an object instead of an array.
    string: z.optional(
      z.union([z.array(ASXmlSingularEntryDecoder), ASXmlSingularEntryDecoder])
    ),
    plurals: z.optional(
      z.union([z.array(ASXmlPluralListDecoder), ASXmlPluralListDecoder])
    ),
  }),
});

export interface ASSerializationOutputSet {
  resources: {
    string: ASXmlSingularEntry[];
    plurals: {
      '@_name': string;
      item: ASXmlPluralEntry[];
    }[];
  };
}
