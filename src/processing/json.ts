import { datasetParser } from '../decoders';
import type { ParserFn, SerializerFn } from '../types';
import { ParsingError } from './processing-errors';

export const parseJson: ParserFn = input => {
  const json = safeParseJson(input);
  if (!json) {
    throw new ParsingError(
      'Invalid JSON format. Please ensure the input is valid JSON.'
    );
  }

  const result = datasetParser.safeParse(json);

  if (!result.success) {
    throw new ParsingError('JSON structure is invalid.', {
      cause: result.error,
    });
  }
  return result.data;
};

export const serializeJson: SerializerFn = dataset => {
  const data = JSON.stringify(dataset, null, 2);

  return [{ data }];
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
