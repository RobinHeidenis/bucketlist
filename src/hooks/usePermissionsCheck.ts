import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { RouterOutputs } from '../utils/api';

export const usePermissionsCheck = (
  listData: RouterOutputs['lists']['getList'],
) => {
  const { data } = useSession();
  const isOwner = data?.user?.id === listData.owner.id;
  const isCollaborator = useMemo(() => {
    if (!listData) return false;
    return listData.collaborators.some(
      (collaborator) => collaborator.id === data?.user?.id,
    );
  }, [listData, data?.user?.id]);

  return { isOwner, isCollaborator };
};