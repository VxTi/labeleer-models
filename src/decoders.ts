import { z } from 'zod';

export const datasetParser = z.record(
  z.string(),
  z.object({
    translations: z.record(z.string(), z.string()),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
);
