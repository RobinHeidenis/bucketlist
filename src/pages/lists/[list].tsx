import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { ListHeaderMenu } from '~/components/list/ListHeaderMenu';
import NiceModal from '@ebay/nice-modal-react';
import { CreateItemModal } from '~/components/modals/CreateItemModal';
import { ListSkeleton } from '~/components/skeletons/ListSkeleton';
import { StandardPage } from '~/components/page/StandardPage';
import { BucketListItems } from '~/components/list/bucket/BucketListItems';
import { MovieListHeader } from '~/components/list/movie/MovieListHeader';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import {
  type BucketList,
  isBucketList,
  isMovieList,
  type MovieList,
  type ShowList,
} from '~/types/List';
import { MovieListItems } from '~/components/list/movie/MovieListItems';
import { ShowListHeader } from '~/components/list/show/ShowListHeader';
import { ShowListItems } from '~/components/list/show/ShowListItems';
import { ScrollToTop } from '~/components/nav/ScrollToTop';

const List = () => {
  const router = useRouter();
  const { list: listId } = router.query;
  const {
    data: listData,
    isFetched,
    error,
  } = api.lists.getList.useQuery(
    { id: listId as string },
    { enabled: !!listId, retry: 3 },
  );
  const { hasPermissions } = usePermissionsCheck(listData);

  const showCreateModal = () => {
    void NiceModal.show(CreateItemModal, { listId: listId as string });
  };

  if (!listData && !isFetched) return <ListSkeleton />;

  if (!listData || error)
    return (
      <StandardPage>
        <div className="prose alert flex flex-col shadow-xl">
          <h1>Not Found</h1>
          <h3>That list was not found :(</h3>
          <h3>Please check if the URL is correct and try again</h3>
          <button
            className="btn btn-primary"
            onClick={() => void router.push('/lists')}
          >
            Go back
          </button>
        </div>
      </StandardPage>
    );

  return (
    <>
      <ScrollToTop />
      <StandardPage>
        <div className="prose w-full max-w-[95%] overflow-hidden min-[823px]:max-w-[85%] 2xl:max-w-[50%]">
          <h1 className="m-0 text-4xl">{listData.title}</h1>
          <p className="mt-3 text-xl">{listData.description}</p>
          <ListHeader list={listData} hasPermissions={hasPermissions} />
          <div className="divider mb-0" />
          <div className="w-full">
            <ListItems list={listData} />
          </div>
          {hasPermissions && isBucketList(listData) && (
            <div
              className={`mb-10 flex w-full flex-row ${
                listData.total === 0 ? 'justify-start' : 'mt-10 justify-end'
              }`}
            >
              <button
                className={`btn btn-primary ${
                  listData.total === 0 ? 'mt-5' : ''
                }`}
                onClick={showCreateModal}
              >
                Add to-do
              </button>
            </div>
          )}
        </div>
      </StandardPage>
    </>
  );
};

const ListHeader = ({
  list,
  hasPermissions,
}: {
  list: BucketList | MovieList | ShowList;
  hasPermissions: boolean;
}) => {
  if (!hasPermissions) return <ListHeaderMenu list={list} />;

  return (
    <>
      <ListHeaderMenu list={list} />
      {list.type === 'MOVIE' && <MovieListHeader listId={list.id} />}
      {list.type === 'SHOW' && <ShowListHeader listId={list.id} />}
    </>
  );
};

const ListItems = ({ list }: { list: BucketList | MovieList | ShowList }) => {
  if (isBucketList(list)) return <BucketListItems list={list} />;
  if (isMovieList(list)) return <MovieListItems list={list} />;
  return <ShowListItems list={list} />;
};

export default List;
