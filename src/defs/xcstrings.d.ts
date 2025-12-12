export type XCStringsDataset = {
  version: string;
  sourceLanguage?: string;
  strings: Record<
    string,
    {
      shouldTranslate: boolean;
      comment: string;
      extractionState: 'manual' | 'automatic';
      localizations: Record<
        string,
        {
          stringUnit: {
            state: 'translated' | 'untranslated';
            value: string;
          };
        }
      >;
    }
  >;
};
