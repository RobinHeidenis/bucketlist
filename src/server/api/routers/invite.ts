import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { zIdSchema } from '../../../schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { getBaseUrl } from '../../../utils/api';
import { env } from '../../../env/server.mjs';

export const inviteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        listId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The list you're trying to create an invite for cannot be found.",
        });

      if (list.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to create an invite for this list.',
        });

      return await ctx.prisma.inviteLink.create({
        data: {
          list: { connect: { id: input.listId } },
          code: Math.random().toString(36).substring(2, 7),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });
    }),
  getInviteByCode: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const invite = await ctx.prisma.inviteLink.findUnique({
        where: { code: input.code },
        include: { list: { include: { owner: true, collaborators: true } } },
      });

      if (!invite)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The invite you're trying to get cannot be found.",
        });

      if (invite.expiresAt < new Date())
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This invite has expired.',
        });

      if (invite.list.ownerId === ctx.session.user.id)
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: "You can't join your own list.",
        });

      if (invite.list.collaborators.some((c) => c.id === ctx.session.user.id))
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'You are already a collaborator on this list.',
        });

      return invite;
    }),
  getInvitesByListId: protectedProcedure
    .input(zIdSchema)
    .query(async ({ ctx, input }) => {
      const invites = await ctx.prisma.inviteLink.findMany({
        where: { listId: input.id },
      });

      return invites.map((i) => ({
        ...i,
        url: `${env.BASE_URL ?? getBaseUrl()}/invite/${i.code}`,
      }));
    }),
  deleteInvite: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.inviteLink.findUnique({
        where: { id: input.id },
        select: { list: { select: { ownerId: true } } },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The invite you're trying to delete cannot be found.",
        });

      if (list.list.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to delete this invite.',
        });

      return await ctx.prisma.inviteLink.delete({
        where: { id: input.id },
      });
    }),
  joinList: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.prisma.inviteLink.findUnique({
        where: { id: input.id },
        include: { list: { include: { collaborators: true } } },
      });

      if (!invite)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });

      if (invite.expiresAt < new Date())
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'This invite has expired.',
        });

      if (invite.list.ownerId === ctx.session.user.id)
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'You are the owner of this list.',
        });

      if (invite.list.collaborators.some((c) => c.id === ctx.session.user.id))
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'You are already a collaborator on this list.',
        });

      return await ctx.prisma.list.update({
        where: { id: invite.listId },
        data: {
          collaborators: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),
});
