import { createTRPCRouter } from '~/server/api/trpc';
import { setItemCheckedProcedure } from './setItemChecked';
import { createItemProcedure } from './createItem';
import { deleteItemProcedure } from './deleteItem';
import { updateItemProcedure } from './updateItem';

export const bucketListRouter = createTRPCRouter({
  setItemChecked: setItemCheckedProcedure,
  createItem: createItemProcedure,
  deleteItem: deleteItemProcedure,
  updateItem: updateItemProcedure,
});
