import { useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { type ListType } from '~/types/List';

export interface Permissions {
  isOwner: boolean;
  isCollaborator: boolean;
  hasPermissions: boolean;
}

export const usePermissionsCheck = (
  list: ListType | undefined,
): Permissions => {
  const { userId } = useAuth();
  const isOwner = userId === list?.owner.id;
  const isCollaborator = useMemo(() => {
    if (!list) return false;
    return list.collaborators.some(
      (collaborator) => collaborator.id === userId,
    );
  }, [list, userId]);

  return {
    isOwner,
    isCollaborator: isCollaborator,
    hasPermissions: isOwner || isCollaborator,
  };
};

