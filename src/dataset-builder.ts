import _merge from 'lodash-es/merge';
import type {
  TranslationDataset,
  TranslationPluralization,
} from '@/definitions';
import type { Locale } from '@/locales';
import { sanitizeLabel } from '@/sanitizer';
/**
 * A builder class for constructing translation datasets.
 */
export class DatasetBuilder {
  private readonly dataset: TranslationDataset;

  constructor() {
    this.dataset = {};
  }

  /**
   * Add a translation to a translation entry.
   */
  addTranslation(
    key: string,
    translations: Partial<Record<Locale, string>>
  ): DatasetBuilder {
    const sanitizedKey = sanitizeLabel(key);
    this.dataset[sanitizedKey] ??= {};
    this.dataset[sanitizedKey].translations ??= {};

    _merge(this.dataset[sanitizedKey].translations, translations);

    return this;
  }

  /**
   * Add a singular translation to a translation entry.
   */
  addTranslationForLocale(
    key: string,
    locale: Locale,
    value: string
  ): DatasetBuilder {
    return this.addTranslation(key, { [locale]: value });
  }

  /**
   * Add plural forms to a translation entry.
   */
  addPluralEntry(
    key: string,
    pluralForms: TranslationPluralization
  ): DatasetBuilder {
    const sanitizedKey = sanitizeLabel(key);
    this.dataset[sanitizedKey] ??= {};
    this.dataset[sanitizedKey].plurals ??= {};

    _merge(this.dataset[sanitizedKey].plurals, pluralForms);
    return this;
  }

  /**
   * Add a description to a translation entry.
   */
  addDescription(
    key: string,
    description: string | undefined | null
  ): DatasetBuilder {
    if (!description) return this;

    const sanitizedKey = sanitizeLabel(key);

    if (!this.dataset[sanitizedKey]) {
      this.dataset[sanitizedKey] = {};
    }
    this.dataset[sanitizedKey].description = description;
    return this;
  }

  /**
   * Add tags to a translation entry.
   */
  addTags(key: string, tags: string[] | undefined): DatasetBuilder {
    if (!tags?.length) return this;

    const sanitizedKey = sanitizeLabel(key);

    if (!this.dataset[sanitizedKey]) {
      this.dataset[sanitizedKey] = {};
    }

    this.dataset[sanitizedKey].tags = tags;
    return this;
  }

  /**
   * Merge another dataset into this builder.
   */
  merge(otherDataset: TranslationDataset): DatasetBuilder {
    _merge(this.dataset, otherDataset);
    return this;
  }

  build(): TranslationDataset {
    return this.dataset;
  }
}
