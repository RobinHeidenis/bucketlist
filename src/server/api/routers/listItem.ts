import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { zIdSchema, zNewListItemSchema } from "../../../schemas/listSchemas";
import { TRPCError } from "@trpc/server";

export const listItemRouter = createTRPCRouter({
  setItemChecked: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        checked: z.boolean()
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: { checked: input.checked }
      });
    }),
  createItem: protectedProcedure
    .input(zNewListItemSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listItem.create({
        data: {
          title: input.title,
          description: input.description,
          list: { connect: { id: input.listId } }
        }
      });
    }),
  deleteItem: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.listItem.findUnique({
        where: { id: input.id },
        select: { list: { select: { ownerId: true } } }
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });
      if (listItem?.list.ownerId !== ctx.session.user.id) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to delete this item"
      });

      return ctx.prisma.listItem.delete({
        where: { id: input.id }
      });
    })
});
