import type { Locale } from '@/locales';
import type { TranslationDataset, TranslationPluralization } from '@/types';

/**
 * A builder class for constructing translation datasets.
 */
export class DatasetBuilder {
  private readonly dataset: TranslationDataset;

  constructor() {
    this.dataset = {};
  }

  addEntries(
    key: string,
    translations: Partial<Record<Locale, string>>
  ): DatasetBuilder {
    this.dataset[key] = { translations };
    return this;
  }

  addEntry(key: string, locale: Locale, value: string): DatasetBuilder {
    return this.addEntries(key, { [locale]: value });
  }

  addPluralEntry(
    key: string,
    pluralForms: TranslationPluralization
  ): DatasetBuilder {
    if (!this.dataset[key]) {
      this.dataset[key] = { plurals: {} };
    }
    this.dataset[key].plurals = {
      ...this.dataset[key].plurals,
      ...pluralForms,
    };
    return this;
  }

  addPluralEntries(
    key: string,
    locale: Locale,
    pluralForms: TranslationPluralization
  ): DatasetBuilder {
    const pluralization: TranslationPluralization = {};
    for (const [quantity, value] of Object.entries(pluralForms)) {
      pluralization[quantity as keyof TranslationPluralization] = {
        [locale]: value,
      };
    }
    return this.addPluralEntry(key, pluralization);
  }

  addComment(key: string, comment: string): DatasetBuilder {
    if (!this.dataset[key]) {
      this.dataset[key] = {};
    }
    this.dataset[key].description = comment;
    return this;
  }

  addDescription(key: string, description: string): DatasetBuilder {
    if (!this.dataset[key]) {
      this.dataset[key] = {};
    }
    this.dataset[key].description = description;
    return this;
  }

  build(): TranslationDataset {
    return this.dataset;
  }
}
