import { type ShowList } from '~/types/List';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import { Show } from '~/components/list/show/Show';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const ShowListItems = ({ list }: { list: ShowList }) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(list);
  const [ref] = useAutoAnimate();

  return (
    <div className="flex flex-col" ref={ref}>
      {list.shows
        .sort((a, b) => {
          if (a.allChecked && !b.allChecked) return 1;
          if (!a.allChecked && b.allChecked) return -1;

          if (a.title > b.title) return 1;
          if (a.title < b.title) return -1;
          return 0;
        })
        .map((show) => (
          <Show
            key={show.id}
            show={show}
            listId={list.id}
            isOwner={isOwner}
            isCollaborator={isCollaborator}
          />
        ))}
    </div>
  );
};
