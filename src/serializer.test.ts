import JSZip from 'jszip';
import { describe, it, expect } from 'vitest';
import { mockDataset } from './__testutils__/mock-dataset';
import { mockSerializationOptions } from './__testutils__/mock-serialization-options';
import { SupportedFormat } from './file-formats';
import { serializeDataset } from './serializer';

describe('serializer', () => {
  describe('Android Strings', () => {
    it('should serialize Android strings correctly', async () => {
      const result = await serializeDataset(
        mockDataset(),
        SupportedFormat.ANDROID_STRINGS,
        mockSerializationOptions({
          locales: ['en_US', 'nl_NL', 'fr_FR'],
        })
      );
      expect(result).toBeDefined();

      const zip = await JSZip.loadAsync(result);

      // It produces zip structure with correct folders and files
      expect(zip.files).toMatchObject({
        'values-en/': expect.objectContaining({
          name: 'values-en/',
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
    it('should serialize Apple strings correctly', async () => {
      const result = await serializeDataset(
        mockDataset(),
        SupportedFormat.APPLE_STRINGS,
        mockSerializationOptions({
          locales: ['en_US', 'nl_NL', 'fr_FR'],
          translateDirect: false,
        })
      );
      expect(result).toBeDefined();

      const zip = await JSZip.loadAsync(result);
      expect(zip.files).toMatchObject({
        'en_US.strings': expect.anything(),
        'nl_NL.strings': expect.anything(),
        'fr_FR.strings': expect.anything(),
      });
    });
  });

  describe('Qt Linquist TS', () => {
    it('should serialize TS files correctly', async () => {
      const result = await serializeDataset(
        mockDataset(),
        SupportedFormat.TS,
        mockSerializationOptions({
          referenceLocale: 'en_US',
          locales: ['en_US', 'nl_NL', 'fr_FR'],
        })
      );
      expect(result).toBeDefined();

      const zip = await JSZip.loadAsync(result);
      expect(zip.files).toMatchObject({
        'nl-NL.ts': expect.anything(),
        'fr-FR.ts': expect.anything(),
      });
    });
  });
});
