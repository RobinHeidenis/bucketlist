import { type ShowList } from '~/types/List';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import { Show } from '~/components/list/show/Show';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useState } from 'react';
import { useSortedShows } from '~/hooks/useSortedShows';
import { useDebouncedState } from '@mantine/hooks';
import { SortAndFilterHeader } from '~/components/list/SortAndFilterHeader';
import { NoItemsMessage } from '~/components/list/NoItemsMessage';

export const ShowListItems = ({ list }: { list: ShowList }) => {
  const permissions = usePermissionsCheck(list);
  const [filterMode, setFilterMode] = useState<string>('default');
  const showItems = useSortedShows(list.shows, filterMode);
  const [filterText, setFilterText] = useDebouncedState('', 300);
  const filteredShows =
    filterText && filterText.length > 2
      ? showItems.filter((show) =>
          show.title.toLowerCase().includes(filterText.toLowerCase()),
        )
      : showItems;

  const [ref] = useAutoAnimate();

  return (
    <div className={'mt-2'}>
      <SortAndFilterHeader
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        setFilterText={setFilterText}
      />
      <div className="mt-5" ref={ref}>
        {filteredShows.map((show) => (
          <Show
            key={show.id}
            show={show}
            listId={list.id}
            permissions={permissions}
          />
        ))}
      </div>
      {filteredShows.length === 0 && <h3>No shows found</h3>}
      <NoItemsMessage
        list={list}
        itemName={'shows'}
        whereToAddMessage={'Go find some shows in the search bar above!'}
        permissions={permissions}
      />
    </div>
  );
};
