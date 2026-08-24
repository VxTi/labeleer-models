import {
  type SerializationFile,
  type SerializationResult,
} from '@/definitions';
import { defaultTransformerSet } from '@/parser';
import { describe, it, expect } from 'vitest';
import { LanguageFileFormat } from './file-formats';
import { mockDataset, mockSerializationOptions } from '@/__testutils__';

const transformerSet = defaultTransformerSet;

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
        'values-en/strings.xml': expect.objectContaining<SerializationFile>({
          content: expect.any(String),
          isDirectory: true,
        }),
        'values-nl/strings.xml': expect.objectContaining<SerializationFile>({
          content: expect.any(String),
          isDirectory: true,
        }),
        'values-fr/strings.xml': expect.objectContaining<SerializationFile>({
          content: expect.any(String),
          isDirectory: true,
        }),
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
        'en-US.strings': expect.any(Object),
        'nl-NL.strings': expect.any(Object),
        'fr-FR.strings': expect.any(Object),
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
        'nl_NL.ts': expect.objectContaining<SerializationFile>({
          content: expect.any(String),
        }),
        'fr_FR.ts': expect.objectContaining<SerializationFile>({
          content: expect.any(String),
        }),
      });
    });
  });
});
