import type { ParserFn, SerializerFn } from '@labeleer/models';
import { datasetParser } from '../decoders';

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
  return JSON.stringify(data, null, 2);
};

function safeParseJson(input: string): object | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}
