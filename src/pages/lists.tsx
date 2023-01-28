import { trpc } from '../utils/trpc';
import { Navbar } from '../components/nav/Navbar';
import { ListCard } from '../components/lists/ListCard';
import { ListCardWrapper } from '../components/lists/ListCardWrapper';
import { PlusSVG } from '../components/lists/PlusSVG';
import NiceModal from '@ebay/nice-modal-react';
import { CreateListModal } from '../components/modals/CreateListModal';

const Lists = () => {
  const { data: lists } = trpc.lists.getLists.useQuery();
  const showCreateModal = () => {
    void NiceModal.show(CreateListModal);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
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
