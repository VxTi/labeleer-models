import type { SerializationOptions } from '../../types';

export function mockSerializationOptions<T extends object = {}>(
  updates: Partial<SerializationOptions<T>> = {}
): SerializationOptions<T> {
  return {
    referenceLocale: 'en_US',
    locales: ['en_US', 'nl_NL', 'fr_FR'],
    ...updates,
  };
}
