import type { SerializationOptions } from '../definitions.js';

export function mockSerializationOptions<
  T extends SerializationOptions = SerializationOptions,
>(updates: Partial<T> = {}): T {
  return {
    referenceLocale: 'en_US',
    locales: ['en_US', 'nl_NL'],
    ...updates,
  } as T;
}
