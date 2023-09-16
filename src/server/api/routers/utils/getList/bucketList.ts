import { type prisma } from '~/server/db';

export const getBucketList = (db: typeof prisma, id: string) =>
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
