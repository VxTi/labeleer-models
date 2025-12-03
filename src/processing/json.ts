import { datasetParser } from '../decoders';
import type { ParserFn, SerializerFn } from '../types';

export const parseJson: ParserFn = input => {
  const json = safeParseJson(input);
  if (!json) {
    return;
  }

  const result = datasetParser.safeParse(json);

  if (!result.success) {
    console.error(result.error);
  }

  return result.success ? result.data : undefined;
};

export const serializeJson: SerializerFn = data => {
  const content = JSON.stringify(data, null, 2);
  return [{ content }];
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
