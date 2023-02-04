import { useRouter } from 'next/router';
import { api } from '../../utils/api';
import { Navbar } from '../../components/nav/Navbar';
import { ListHeaderMenu } from '../../components/list/ListHeaderMenu';
import { ListItem } from '../../components/list/ListItem';
import { Fragment } from 'react';
import { useRequireSignin } from '../../hooks/useRequireSignin';
import NiceModal from '@ebay/nice-modal-react';
import { CreateItemModal } from '../../components/modals/CreateItemModal';

const List = () => {
  useRequireSignin();
  const router = useRouter();
  const { list: listId } = router.query;
  const { data: listData, isLoading } = api.lists.getList.useQuery(
    { id: listId as string },
    { enabled: !!listId },
  );

  const showCreateModal = () => {
    void NiceModal.show(CreateItemModal, { listId: listId as string });
  };

  if (!listData && !isLoading) return <div>404</div>;

  if (!listData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
      <Navbar />
      <main className="mt-10 flex flex-col items-center justify-center">
        <div className="prose w-1/2">
          <h1 className="m-0 text-4xl">{listData.title}</h1>
          <p className="mt-3 text-xl">{listData.description}</p>
          <ListHeaderMenu {...listData} />
          <div className="divider" />
          <div className="mt-5">
            {listData.items.map((item) => (
              <Fragment key={item.id}>
                <ListItem {...item} />
                <div className="divider" />
              </Fragment>
            ))}
            {listData.items.length === 0 && (
              <>
                <h3 className="m-0">
                  Oh no! You don&apos;t have any items on this list :(
                </h3>
                <h4 className="m-0">Click the button below to add one!</h4>
              </>
            )}
          </div>
          <div
            className={`mb-10 flex w-full flex-row ${
              listData.items.length === 0 ? 'justify-start' : 'justify-end'
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
        </div>
      </main>
    </div>
  );
};

export default List;
