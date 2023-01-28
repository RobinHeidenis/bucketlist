import { z } from 'zod';

export const zNewListSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});
