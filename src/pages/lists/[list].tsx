import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { ListHeaderMenu } from '~/components/list/ListHeaderMenu';
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
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const List = () => {
  const router = useRouter();
  const { list: listId } = router.query;

  const {
    data: list,
    isFetched,
    error,
  } = api.lists.getList.useQuery(
    {
      id: listId as string,
    },
    { enabled: !!listId, retry: 3 },
  );

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
            <ArrowLeftIcon className="h-5 w-5" />
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
          <h1 className="m-0 text-4xl">{list.title}</h1>
          <p className="mt-3 text-xl">{list.description}</p>
          <ListHeader list={list} />
          <div className="divider mb-0" />
          <div className="w-full">
            <ListItems list={list} />
          </div>
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
