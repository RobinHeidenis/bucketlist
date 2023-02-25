import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import { ListHeaderMenu } from '../../components/list/ListHeaderMenu';
import { useMemo } from 'react';
import { useRequireSignin } from '../../hooks/useRequireSignin';
import NiceModal from '@ebay/nice-modal-react';
import { CreateItemModal } from '../../components/modals/CreateItemModal';
import { ListSkeleton } from '../../components/skeletons/ListSkeleton';
import { StandardPage } from '../../components/page/StandardPage';
import { useSession } from 'next-auth/react';
import { ListItems } from '../../components/list/ListItems';
import { MovieListHeader } from '../../components/list/MovieListHeader';

const List = () => {
  useRequireSignin();
  const router = useRouter();
  const { data } = useSession();
  const { list: listId } = router.query;
  const {
    data: listData,
    isFetched,
    error,
  } = api.lists.getList.useQuery(
    { id: listId as string },
    { enabled: !!listId, retry: false },
  );

  const isCollaborator = useMemo(() => {
    if (!listData) return false;
    return listData.collaborators.some(
      (collaborator) => collaborator.id === data?.user?.id,
    );
  }, [listData, data?.user?.id]);

  const showCreateModal = () => {
    void NiceModal.show(CreateItemModal, { listId: listId as string });
  };

  if (!listData && !isFetched) return <ListSkeleton />;

  if (!listData || error)
    return (
      <StandardPage>
        <div className="alert prose flex flex-col shadow-xl">
          <h1>Not Found</h1>
          <h3>That list was not found :(</h3>
          <h3>Please check if the URL is correct and try again</h3>
          <button
            className="btn-primary btn"
            onClick={() => void router.push('/lists')}
          >
            Go back
          </button>
        </div>
      </StandardPage>
    );

  const isOwner = data?.user?.id === listData.owner.id;
  const length =
    listData.type === 'BUCKET' ? listData.items.length : listData.movies.length;

  return (
    <StandardPage>
      <div className="prose w-1/2">
        <h1 className="m-0 text-4xl">{listData.title}</h1>
        <p className="mt-3 text-xl">{listData.description}</p>
        <ListHeaderMenu {...listData} />
        {listData.type === 'MOVIE' && <MovieListHeader listId={listData.id} />}
        <div className="divider" />
        <div className="mt-5">
          <ListItems listData={listData} />
        </div>
        {(isOwner || isCollaborator) && listData.type === 'BUCKET' && (
          <div
            className={`mb-10 flex w-full flex-row ${
              length === 0 ? 'justify-start' : 'justify-end'
            }`}
          >
            <button
              className={`btn-primary btn ${length === 0 ? 'mt-5' : ''}`}
              onClick={showCreateModal}
            >
              Add to-do
            </button>
          </div>
        )}
      </div>
    </StandardPage>
  );
};

export default List;
