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
  isBucketList,
  isMovieList,
  isShowList,
  type PropsWithList,
} from '~/types/List';
import { MovieListItems } from '~/components/list/movie/MovieListItems';
import { ShowListHeader } from '~/components/list/show/ShowListHeader';
import { ShowListItems } from '~/components/list/show/ShowListItems';
import { ScrollToTop } from '~/components/nav/ScrollToTop';

const List = () => {
  const router = useRouter();
  const { list: listId } = router.query;
  if (!listId || typeof listId !== 'string')
    throw new Error('List ID is not a string');

  const queryClient = api.useContext();
  const previousQueryData = queryClient.lists.getList.getData({
    id: listId,
  });

  const previousUpdatedAt =
    previousQueryData?.updatedAt instanceof Date
      ? previousQueryData.updatedAt.toISOString()
      : undefined;

  const {
    data: list,
    isFetched,
    error,
  } = api.lists.getList.useQuery(
    {
      id: listId,
      updatedAt: previousUpdatedAt,
    },
    { enabled: !!listId, retry: 3 },
  );

  const { hasPermissions } = usePermissionsCheck(list);

  if (!list && !isFetched) return <ListSkeleton />;

  if (!list || error)
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

  // If code is set in the current query data, it means the updatedAt parameter sent to the server is the same as the one in the database.
  // This means that our local data is the same as the server data, so we can just use set data to the previous query data.
  if (previousQueryData && 'code' in list) {
    queryClient.lists.getList.setData(
      { id: listId, updatedAt: previousUpdatedAt },
      () => {
        return { ...previousQueryData };
      },
    );
    return;
  }

  if ('code' in list) throw new Error('Data is not a list');

  return (
    <>
      <ScrollToTop />
      <StandardPage>
        <div className="prose w-full max-w-[95%] overflow-hidden min-[823px]:max-w-[85%] 2xl:max-w-[50%]">
          <h1 className="m-0 text-4xl">{list.title}</h1>
          <p className="mt-3 text-xl">{list.description}</p>
          <ListHeader list={list} />
          <div className="divider mb-0" />
          <div className="w-full">
            <ListItems list={list} />
          </div>
          {hasPermissions && isBucketList(list) && (
            <div
              className={`mb-10 flex w-full flex-row ${
                list.total === 0 ? 'justify-start' : 'mt-10 justify-end'
              }`}
            >
              <button
                className={`btn btn-primary ${list.total === 0 ? 'mt-5' : ''}`}
                onClick={() =>
                  void NiceModal.show(CreateItemModal, { listId: listId })
                }
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

const ListHeader = ({ list }: PropsWithList) => {
  const { hasPermissions } = usePermissionsCheck(list);
  if (!hasPermissions) return <ListHeaderMenu list={list} />;

  return (
    <>
      <ListHeaderMenu list={list} />
      {isMovieList(list) && <MovieListHeader list={list} />}
      {isShowList(list) && <ShowListHeader list={list} />}
    </>
  );
};

const ListItems = ({ list }: PropsWithList) => {
  if (isBucketList(list)) return <BucketListItems list={list} />;
  if (isMovieList(list)) return <MovieListItems list={list} />;
  return <ShowListItems list={list} />;
};

export default List;
