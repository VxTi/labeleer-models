import type { ParsingOptions } from '@/definitions';

export function mockParsingOptions<T extends object = {}>(
  updates: Partial<ParsingOptions<T>> = {}
): ParsingOptions<T> {
  return {
    referenceLocale: 'en_US',
    ...updates,
  } as ParsingOptions<T>;
}
