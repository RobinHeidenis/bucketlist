import { api } from '~/utils/api';
import { ListCard } from '~/components/lists/ListCard';
import { ListCardWrapper } from '~/components/lists/ListCardWrapper';
import { PlusSVG } from '~/components/lists/PlusSVG';
import NiceModal from '@ebay/nice-modal-react';
import { CreateListModal } from '~/components/modals/CreateListModal';
import { useRequireSignin } from '~/hooks/useRequireSignin';
import { ListIndexSkeleton } from '~/components/skeletons/ListIndexSkeleton';
import { StandardPage } from '~/components/page/StandardPage';

const Lists = () => {
  useRequireSignin();
  const { data: lists, isLoading } = api.lists.getLists.useQuery();
  const showCreateModal = () => {
    void NiceModal.show(CreateListModal);
  };

  if (!lists && isLoading) return <ListIndexSkeleton />;

  return (
    <StandardPage>
      <div className="prose">
        <h1>Your lists</h1>
        <div className="divider" />
      </div>
      <div className="mb-12 mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {lists?.map((list) => (
          <ListCard {...list} key={list.id} />
        ))}
        <ListCardWrapper onClick={showCreateModal}>
          <div className="flex flex-col items-center justify-center">
            <h2 className="card-title">Create new list</h2>
            <PlusSVG />
          </div>
        </ListCardWrapper>
      </div>
    </StandardPage>
  );
};

export default Lists;
