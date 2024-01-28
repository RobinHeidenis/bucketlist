import { z } from 'zod';

export const toggleListItemCheckedSchema = z.object({
  id: z.number(),
  listId: z.string().uuid(),
  checked: z.boolean(),
});
