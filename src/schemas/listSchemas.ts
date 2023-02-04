import { z } from 'zod';

export const zNewListSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const zEditListSchema = zNewListSchema.extend({
  id: z.string().uuid(),
});

export const zNewListItemSchema = z.object({
  title: z.string().min(1).max(46),
  description: z.string().max(500).optional(),
  listId: z.string().uuid(),
});

export const zEditListItemSchema = zNewListItemSchema.extend({
  id: z.string().uuid(),
  listId: z.string().uuid().optional(),
});

export const zIdSchema = z.object({
  id: z.string().uuid(),
});