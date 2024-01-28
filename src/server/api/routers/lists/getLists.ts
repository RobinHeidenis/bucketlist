import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const getLists = async ({ ctx }: { ctx: AuthedTRPCContext }) => {
  const lists = await ctx.prisma.list.findMany({
    where: {
      OR: [
        { ownerId: ctx.auth.userId },
        { collaborators: { some: { id: ctx.auth.userId } } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      isPublic: true,
      ownerId: true,
      updatedAt: true,
      bucketListItems: {
        select: { checked: true },
      },
      collections: {
        select: { _count: { select: { movies: true } } },
      },
      _count: {
        select: {
          movies: true,
          shows: true,
          checkedMovies: true,
          checkedEpisodes: true,
        },
      },
    },
    orderBy: { title: 'asc' },
  });

  return lists.map((list) => {
    const baseList = {
      id: list.id,
      title: list.title,
      description: list.description,
      role:
        list.ownerId === ctx.auth.userId
          ? ('owner' as const)
          : ('contributor' as const),
      isPublic: list.isPublic,
      updatedAt: list.updatedAt,
      type: list.type,
      ownerId: list.ownerId,
    };

    if (list.type === 'BUCKET')
      return {
        ...baseList,
        type: 'BUCKET' as const,
        amountChecked: list.bucketListItems.filter((i) => i.checked).length,
        amount: list.bucketListItems.length,
      };
    else if (list.type === 'MOVIE')
      return {
        ...baseList,
        type: 'MOVIE' as const,
        amountChecked: list._count.checkedMovies,
        amount:
          list._count.movies +
          list.collections
            .map((c) => c._count.movies)
            .reduce((a, b) => a + b, 0),
      };
    else
      return {
        ...baseList,
        type: 'SHOW' as const,
        amountChecked: list._count.checkedEpisodes,
        amount: list._count.shows,
      };
  });
};

export const getListsProcedure = protectedProcedure.query(getLists);
