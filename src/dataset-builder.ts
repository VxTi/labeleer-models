import _merge from 'lodash-es/merge';
import {
  type TranslationDataset,
  type TranslationLocalizedEntries,
  type TranslationPluralization,
} from '@/definitions';
import type { Locale } from '@/locales';
import { sanitizeLabel } from '@/sanitizer';
/**
 * A builder class for constructing translation datasets.
 */
export class DatasetBuilder {
  private readonly dataset: TranslationDataset;

  public constructor() {
    this.dataset = {};
  }

  /**
   * Add a translation to a translation entry.
   */
  public addTranslation(
    key: string,
    translations: Partial<TranslationLocalizedEntries>
  ): this {
    const sanitizedKey = sanitizeLabel(key);
    this.ensureExistence(sanitizedKey);

    _merge(this.dataset[sanitizedKey].translations, translations);

    return this;
  }

  /**
   * Add a singular translation to a translation entry.
   */
  public addTranslationForLocale(
    key: string,
    locale: Locale,
    value: string
  ): this {
    return this.addTranslation(key, { [locale]: value });
  }

  /**
   * Add plural forms to a translation entry.
   */
  public addPluralEntry(
    key: string,
    pluralForms: TranslationPluralization | undefined
  ): this {
    if (!pluralForms) return this;

    const sanitizedKey = sanitizeLabel(key);
    this.ensureExistence(sanitizedKey);

    _merge(this.dataset[sanitizedKey].plurals, pluralForms);
    return this;
  }

  /**
   * Add a description to a translation entry.
   */
  public addDescription(
    key: string,
    description: string | undefined | null
  ): this {
    if (!description) return this;

    const sanitizedKey = sanitizeLabel(key);
    this.ensureExistence(sanitizedKey);

    this.dataset[sanitizedKey].description = description;
    return this;
  }

  /**
   * Add tags to a translation entry.
   */
  addTags(key: string, tags: string[] | undefined): this {
    if (!tags?.length) return this;

    const sanitizedKey = sanitizeLabel(key);

    this.ensureExistence(sanitizedKey);
    this.dataset[sanitizedKey].tags = tags;
    return this;
  }

  /**
   * Merge another dataset into this builder.
   */
  public merge(otherDataset: TranslationDataset): this {
    _merge(this.dataset, otherDataset);
    return this;
  }

  private ensureExistence(key: string): void {
    this.dataset[key] ??= { translations: {}, plurals: {} };
  }

  build(): TranslationDataset {
    return this.dataset;
  }
}
