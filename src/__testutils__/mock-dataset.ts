import type { TranslationDataset } from '../definitions';

export function mockDataset(
  updates: Partial<TranslationDataset> = {}
): TranslationDataset {
  return {
    'first-entry': {
      translations: {
        en_US: 'hello',
        nl_NL: 'world',
      },
    },
    'second-entry': {
      translations: {
        en_US: 'hello',
        nl_NL: 'again',
      },
    },
    ...updates,
  };
}

export function mockPluralDataset(
  updates: Partial<TranslationDataset> = {}
): TranslationDataset {
  return {
    'plural-entry': {
      plurals: {
        one: {
          en_US: 'One thing',
        },
        other: {
          en_US: 'Many things',
        },
      },
    },
    ...updates,
  };
}
