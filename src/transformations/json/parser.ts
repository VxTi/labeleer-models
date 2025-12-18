import { JsonTranslationDatasetDecoder } from '@/decoders';
import type { ParserFn } from '@/definitions';
import { ParsingError } from '@/errors';

export const parseJson: ParserFn = async input => {
  const json = safeParseJson(input);
  if (!json) {
    throw new ParsingError(
      'Invalid JSON format. Please ensure the input is valid JSON.'
    );
  }

  const result = await JsonTranslationDatasetDecoder.safeParseAsync(json);

  if (!result.success) {
    throw new ParsingError('JSON structure is invalid.', {
      cause: result.error,
    });
  }
  return Promise.resolve(result.data);
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
