import { type SerializationResult } from '@/definitions';
import { defaultParserSet } from '@/parser';
import { describe, it, expect } from 'vitest';
import { LanguageFileFormat } from './file-formats';
import { mockDataset, mockSerializationOptions } from '@/__testutils__';

const transformerSet = defaultParserSet;

describe('serializer', () => {
  describe('Android Strings', () => {
    it('should serialize Android strings correctly', () => {
      const result = transformerSet.serialize(
        mockDataset(),
        LanguageFileFormat.ANDROID_STRINGS,
        mockSerializationOptions({
          locales: ['en_US', 'nl_NL', 'fr_FR'],
        })
      );

      expect(result).toMatchObject<SerializationResult>({
        'values-en/': expect.objectContaining({
          filename: 'values-en/',
          dir: true,
        }),
        'values-en/strings.xml': expect.anything(),
        'values-nl/': expect.objectContaining({
          name: 'values-nl/',
          dir: true,
        }),
        'values-nl/strings.xml': expect.anything(),
        'values-fr/': expect.objectContaining({
          name: 'values-fr/',
          dir: true,
        }),
        'values-fr/strings.xml': expect.anything(),
      });
    });
  });

  describe('Apple Strings', () => {
    it('should serialize Apple strings correctly', () => {
      const result = transformerSet.serialize(
        mockDataset(),
        LanguageFileFormat.APPLE_STRINGS,
        mockSerializationOptions({
          locales: ['en_US', 'nl_NL', 'fr_FR'],
          keylessTranslation: false,
        })
      );
      expect(result).toMatchObject<SerializationResult>({
        'en-US.strings': expect.anything(),
        'nl-NL.strings': expect.anything(),
        'fr-FR.strings': expect.anything(),
      });
    });
  });

  describe('Qt Linquist TS', () => {
    it('should serialize TS files correctly', () => {
      const result = transformerSet.serialize(
        mockDataset(),
        LanguageFileFormat.TS,
        mockSerializationOptions({
          referenceLocale: 'en_US',
          locales: ['en_US', 'nl_NL', 'fr_FR'],
        })
      );
      expect(result).toMatchObject<SerializationResult>({
        'nl_NL.ts': expect.anything(),
        'fr_FR.ts': expect.anything(),
      });
    });
  });
});
