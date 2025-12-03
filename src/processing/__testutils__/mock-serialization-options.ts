import type { SerializationOptions } from '../../types';

export function mockSerializationOptions(
  updates: Partial<SerializationOptions> = {}
): SerializationOptions {
  return {
    referenceLocale: 'en_US',
    locales: ['en_US', 'nl_NL', 'fr_FR'],
    ...updates,
  };
}
