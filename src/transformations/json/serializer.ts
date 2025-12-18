import type { SerializerFn } from '@/definitions';
import { DEFAULT_JSON_FILE_NAME } from '@/transformations/json/common';

export const serializeJson: SerializerFn = dataset => {
  const data = JSON.stringify(dataset, null, 2);

  return Promise.resolve([
    {
      filename: DEFAULT_JSON_FILE_NAME,
      data,
    },
  ]);
};
