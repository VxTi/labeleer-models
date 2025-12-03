declare module '@labeleer/models' {
  export interface TranslationEntry {
    translations: Record<string, string>;
    tags?: string[];
    description?: string;
  }

  export type TranslationDataset = Record<string, TranslationEntry>;

  export type ParserFn = (input: string) => TranslationDataset | undefined;

  export type SerializerFn = (
    dataset: TranslationDataset
  ) => string | undefined;
}
