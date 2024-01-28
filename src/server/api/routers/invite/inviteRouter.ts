import { createTRPCRouter } from '~/server/api/trpc';
import { createInviteProcedure } from './createInvite';
import { getInviteByCodeProcedure } from './getInviteByCode';
import { getInvitesByListIdProcedure } from './getInvitesByListId';
import { deleteInviteProcedure } from './deleteInvite';
import { joinListProcedure } from './joinList';

export const inviteRouter = createTRPCRouter({
  createInvite: createInviteProcedure,
  getInviteByCode: getInviteByCodeProcedure,
  getInvitesByListId: getInvitesByListIdProcedure,
  deleteInvite: deleteInviteProcedure,
  joinList: joinListProcedure,
});
