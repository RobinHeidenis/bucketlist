import { useEffect, useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { PropsWithMovieList } from '~/types/List';
import { isCollection } from '~/types/List';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import type { sortMap } from '~/hooks/useSortedMovieItems';
import { useSortedMovieItems } from '~/hooks/useSortedMovieItems';
import { Movie } from './Movie';
import { Collection } from './Collection';
import { useDebouncedState } from '@mantine/hooks';
import { SortAndFilterHeader } from '~/components/list/SortAndFilterHeader';
import { NoItemsMessage } from '~/components/list/NoItemsMessage';

export const MovieListItems = ({ list }: PropsWithMovieList) => {
  const permissions = usePermissionsCheck(list);
  const [filterMode, setFilterMode] = useState<string>('default');
  const movieItems = useSortedMovieItems(
    list,
    filterMode as keyof typeof sortMap,
  );
  const [filterText, setFilterText] = useDebouncedState('', 300);
  const filteredMovieItems =
    !filterText || filterText.length <= 2
      ? movieItems
      : movieItems.filter((item) =>
          (isCollection(item) ? item.name : item.title)
            .toLowerCase()
            .includes(filterText.toLowerCase()),
        );
  const [ref, enable] = useAutoAnimate();
  useEffect(() => {
    enable(true);
  }, [filteredMovieItems, enable]);

  return (
    <div className={'mt-2'}>
      <SortAndFilterHeader
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        setFilterText={setFilterText}
        setAnimationsEnabled={enable}
      />
      <div ref={ref} className="mt-5">
        {filteredMovieItems.map((item) => (
          <RenderIfVisible defaultHeight={144} key={item.id}>
            {isCollection(item) ? (
              <Collection
                collection={item}
                permissions={permissions}
                listId={list.id}
              />
            ) : (
              <Movie movie={item} permissions={permissions} listId={list.id} />
            )}
          </RenderIfVisible>
        ))}
      </div>
      {filteredMovieItems.length === 0 && <h3>No items found</h3>}
      <NoItemsMessage
        list={list}
        itemName={'movies'}
        whereToAddMessage={'Go find some movies in the search bar above!'}
        permissions={permissions}
      />
    </div>
  );
};
