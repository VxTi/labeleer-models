import type { SerializationOptions } from '@/definitions';

export function mockSerializationOptions<T extends {} = {}>(
  updates: Partial<SerializationOptions<T>> = {}
): SerializationOptions<T> {
  return {
    referenceLocale: 'en_US',
    locales: ['en_US', 'nl_NL'],
    ...updates,
  } as SerializationOptions<T>;
}
