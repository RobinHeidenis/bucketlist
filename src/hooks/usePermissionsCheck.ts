import { useMemo } from 'react';
import type { RouterOutputs } from '~/utils/api';
import { useAuth } from '@clerk/nextjs';

export const usePermissionsCheck = (
  listData: Partial<RouterOutputs['lists']['getList']> | undefined,
) => {
  const { userId } = useAuth();
  const isOwner = userId === listData?.owner?.id;
  const isCollaborator = useMemo(() => {
    if (!listData) return false;
    return listData?.collaborators?.some(
      (collaborator) => collaborator.id === userId,
    );
  }, [listData, userId]);

  return { isOwner, isCollaborator: isCollaborator ?? false };
};
