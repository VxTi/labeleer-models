import { z } from 'zod';
import { quantities } from '@/constants';
import type { PluralizationQuantity } from '@/types';

const serializationIrFragmentDecoder = z.object({
  '@_name': z.string(),
  '#text': z.string(),
});

export const pluralSerializationIrFragmentDecoder = z.object({
  '@_name': z.string(),
  item: z.array(
    z.object({
      '@_quantity': z.enum(quantities),
      '#text': z.string(),
    })
  ),
});

export const serializationIrDecoder = z.object({
  resources: z.object({
    // When the user only has a single resource entry, fast-xml-parser
    // will parse it as an object instead of an array.
    string: z.union([
      z.array(serializationIrFragmentDecoder),
      serializationIrFragmentDecoder,
    ]),
    plurals: z.union([
      z.array(pluralSerializationIrFragmentDecoder),
      pluralSerializationIrFragmentDecoder,
    ]),
  }),
});

export type SingularAndroidStringsEntry = { '@_name': string; '#text': string };

export interface PluralizedAndroidStringsEntry {
  '@_quantity': PluralizationQuantity;
  '#text': string;
}

export interface AndroidStringsSet {
  resources: {
    string: SingularAndroidStringsEntry[];
    plurals: {
      '@_name': string;
      item: PluralizedAndroidStringsEntry[];
    }[];
  };
}
