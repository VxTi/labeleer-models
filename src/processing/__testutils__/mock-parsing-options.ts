import type { ParsingOptions } from '../../types';

export function mockParsingOptions<T extends object = {}>(
  updates: Partial<ParsingOptions<T>> = {}
): ParsingOptions<T> {
  return {
    referenceLocale: 'en_US',
    ...updates,
  };
}
