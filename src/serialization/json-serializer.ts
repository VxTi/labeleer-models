import type { SerializerFn } from '../types';

export const serializeJson: SerializerFn = dataset => {
  const data = JSON.stringify(dataset, null, 2);

  return [{ data }];
};
