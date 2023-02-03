import { z } from 'zod';

export const zNewListSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const zNewListItemSchema = z.object({
  title: z.string().min(1).max(46),
  description: z.string().max(500).optional(),
  listId: z.string().uuid(),
});

export const zIdSchema = z.object({
  id: z.string().uuid(),
});