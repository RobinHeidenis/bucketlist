import { createTRPCRouter } from '~/server/api/trpc';
import { getListsProcedure } from './getLists';
import { getListProcedure } from './getList';
import { deleteListProcedure } from './deleteList';
import { createListProcedure } from './createList';
import { updateListProcedure } from './updateList';
import { setPublicProcedure } from './setPublic';
import { leaveListProcedure } from './leaveList';

export const listsRouter = createTRPCRouter({
  getLists: getListsProcedure,
  getList: getListProcedure,
  createList: createListProcedure,
  deleteList: deleteListProcedure,
  updateList: updateListProcedure,
  setPublic: setPublicProcedure,
  leaveList: leaveListProcedure,
});
