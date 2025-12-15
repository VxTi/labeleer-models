import { z } from 'zod';
import { quantities } from '@/constants';

const serializationIrFragmentDecoder = z.object({
  '#text': z.string(),
  '@_name': z.string(),
});

export type SingularAndroidStringsEntry = z.infer<
  typeof serializationIrFragmentDecoder
>;

export const pluralizationIrItemDecoder = z.object({
  '@_quantity': z.enum(quantities),
  '#text': z.string(),
});

export type PluralizedAndroidStringsEntry = z.infer<
  typeof pluralizationIrItemDecoder
>;

export const pluralSerializationIrFragmentDecoder = z.object({
  '@_name': z.string(),
  item: z.array(pluralizationIrItemDecoder),
});

export type PluralizedAndroidStringsSetEntry = z.infer<
  typeof pluralSerializationIrFragmentDecoder
>;

export const serializationIrDecoder = z.object({
  resources: z.object({
    // When the user only has a single resource entry, fast-xml-parser
    // will parse it as an object instead of an array.
    string: z.optional(
      z.union([
        z.array(serializationIrFragmentDecoder),
        serializationIrFragmentDecoder,
      ])
    ),
    plurals: z.optional(
      z.union([
        z.array(pluralSerializationIrFragmentDecoder),
        pluralSerializationIrFragmentDecoder,
      ])
    ),
  }),
});

export interface AndroidStringsSet {
  resources: {
    string: SingularAndroidStringsEntry[];
    plurals: {
      '@_name': string;
      item: PluralizedAndroidStringsEntry[];
    }[];
  };
}
