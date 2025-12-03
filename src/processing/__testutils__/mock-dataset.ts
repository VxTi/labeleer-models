import type { TranslationDataset } from '../../types';

export function mockDataset(
  updates: Partial<TranslationDataset> = {}
): TranslationDataset {
  return {
    'first-entry': {
      translations: {
        en_US: 'hello',
        nl_NL: 'world',
      },
      plurals: {
        en_US: 'hellos',
        nl_NL: 'werelden',
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
