import type { MaybeArray } from '@/definitions';

export function extractArray<T>(arr: MaybeArray<T> | undefined): T[] {
  if (!arr) return [];

  return Array.isArray(arr) ? arr : [arr];
}

export function entries<TKey extends string, TValue>(
  input: Record<TKey, TValue> | Partial<Record<TKey, TValue>>
): [TKey, TValue][] {
  return Object.entries(input) as [TKey, TValue][];
}

export function keys<TKey extends string>(
  input: Record<TKey, unknown>
): TKey[] {
  return Object.keys(input) as TKey[];
}
