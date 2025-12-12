import { SupportedFormat } from './format/file-formats';

/**
 * Get the file format from a given file path based on its extension.
 * @param filePath - The file path to analyze, e.g., `/path/to/file.json`.
 * @returns The detected SupportedFormat or undefined if not recognized.
 */
export function getFormatFromPath(
  filePath: string
): SupportedFormat | undefined {
  return Object.values(SupportedFormat).find(fmt =>
    filePath.endsWith(`.${fmt}`)
  );
}
