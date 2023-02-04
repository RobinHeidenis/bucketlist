import { api } from '../../utils/api';
import { Navbar } from '../../components/nav/Navbar';
import { ListCard } from '../../components/lists/ListCard';
import { ListCardWrapper } from '../../components/lists/ListCardWrapper';
import { PlusSVG } from '../../components/lists/PlusSVG';
import NiceModal from '@ebay/nice-modal-react';
import { CreateListModal } from '../../components/modals/CreateListModal';
import { useRequireSignin } from '../../hooks/useRequireSignin';
import { ListIndexSkeleton } from "../../components/skeletons/ListIndexSkeleton";

const Lists = () => {
  useRequireSignin();
  const { data: lists, isLoading } = api.lists.getLists.useQuery();
  const showCreateModal = () => {
    void NiceModal.show(CreateListModal);
  };

  if(!lists && !isLoading) return <div>404</div>;

  if(!lists) return <ListIndexSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-transparent to-blue-900">
      <Navbar />
      <main className="mt-10 flex flex-col items-center justify-center">
        <h1 className="text-4xl">Lists</h1>
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          {lists?.map((list) => (
            <ListCard list={list} key={list.id} />
          ))}
          <ListCardWrapper onClick={showCreateModal}>
            <div className="flex flex-col items-center justify-center">
              <h2 className="card-title">Create new list</h2>
              <PlusSVG />
            </div>
          </ListCardWrapper>
        </div>
      </main>
    </div>
  );
};

export default Lists;
