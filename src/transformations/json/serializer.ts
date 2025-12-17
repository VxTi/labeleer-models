import type { SerializerFn } from '@/definitions';

export const serializeJson: SerializerFn = dataset => {
  const data = JSON.stringify(dataset, null, 2);

  return Promise.resolve(data);
};
