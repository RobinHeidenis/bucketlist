import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import { ListHeaderMenu } from '../../components/list/ListHeaderMenu';
import { useRequireSignin } from '../../hooks/useRequireSignin';
import NiceModal from '@ebay/nice-modal-react';
import { CreateItemModal } from '../../components/modals/CreateItemModal';
import { ListSkeleton } from '../../components/skeletons/ListSkeleton';
import { StandardPage } from '../../components/page/StandardPage';
import { ListItems } from '../../components/list/ListItems';
import { MovieListHeader } from '../../components/list/MovieListHeader';
import { usePermissionsCheck } from '../../hooks/usePermissionsCheck';

const List = () => {
  useRequireSignin();
  const router = useRouter();
  const { list: listId } = router.query;
  const {
    data: listData,
    isFetched,
    error,
  } = api.lists.getList.useQuery(
    { id: listId as string },
    { enabled: !!listId, retry: false },
  );
  const { isOwner, isCollaborator } = usePermissionsCheck(listData);

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

  return (
    <StandardPage>
      <div className="prose w-full max-w-[40%]">
        <h1 className="m-0 text-4xl">{listData.title}</h1>
        <p className="mt-3 text-xl">{listData.description}</p>
        <ListHeaderMenu listData={listData} />
        {listData.type === 'MOVIE' && (isOwner || isCollaborator) && (
          <MovieListHeader listId={listData.id} />
        )}
        <div className="divider mb-0" />
        <div className="w-full">
          <ListItems listData={listData} />
        </div>
        {(isOwner || isCollaborator) && listData.type === 'BUCKET' && (
          <div
            className={`mb-10 flex w-full flex-row ${
              listData.items.length === 0
                ? 'justify-start'
                : 'mt-10 justify-end'
            }`}
          >
            <button
              className={`btn-primary btn ${
                listData.items.length === 0 ? 'mt-5' : ''
              }`}
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
