import { type db as Prisma } from '~/server/db';

export const getBucketList = (db: typeof Prisma, id: string) =>
  db.list.findUnique({
    where: { id },
    include: {
      bucketListItems: {
        orderBy: [{ title: 'asc' }, { checked: 'asc' }],
      },
      collaborators: { select: { id: true } },
      owner: { select: { id: true } },
    },
  });
