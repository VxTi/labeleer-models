import { JsonTranslationDatasetDecoder } from '@/common/decoders';
import type { ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';

export const parseJson: ParserFn = input => {
  const json = safeParseJson(input);
  if (!json) {
    throw new ParsingError(
      'Invalid JSON format. Please ensure the input is valid JSON.'
    );
  }

  const result = JsonTranslationDatasetDecoder.safeParse(json);

  if (!result.success) {
    throw new ParsingError('JSON structure is invalid.', {
      cause: result.error,
    });
  }
  return result.data;
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
