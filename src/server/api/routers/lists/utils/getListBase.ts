import { type List } from '@prisma/client';
import { type Collaborator } from '~/types/List';
import { type User } from '@clerk/clerk-sdk-node';

export const getListBase = (
  list: List & { collaborators: Collaborator[] },
  {
    firstName,
    lastName,
    externalAccounts,
  }: Pick<User, 'firstName' | 'lastName' | 'externalAccounts'>,
) => ({
  id: list.id,
  title: list.title,
  description: list.description,
  isPublic: list.isPublic,
  type: list.type,
  owner: {
    id: list.ownerId,
    name:
      (`${firstName ?? ''} ${lastName ?? ''}`.trim() ||
        externalAccounts[0]?.firstName) ??
      "User that somehow doesn't have a name or a connected account",
  },
  collaborators: list.collaborators,
});

export type ListBase = ReturnType<typeof getListBase>;
