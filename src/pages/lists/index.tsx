import { api } from '~/utils/api';
import { ListCard } from '~/components/lists/ListCard';
import { ListCardWrapper } from '~/components/lists/ListCardWrapper';
import { PlusSVG } from '~/components/lists/PlusSVG';
import NiceModal from '@ebay/nice-modal-react';
import { CreateListModal } from '~/components/modals/CreateListModal';
import { ListIndexSkeleton } from '~/components/skeletons/ListIndexSkeleton';
import { StandardPage } from '~/components/page/StandardPage';
import { CustomDropdown } from '~/components/dropdown/CustomDropdown';
import {
  ArrowPathIcon,
  ArrowsUpDownIcon,
  DocumentCheckIcon,
  DocumentMinusIcon,
  DocumentPlusIcon,
} from '@heroicons/react/24/outline';
import { TIcon } from '~/components/list/movie/TIcon';
import { useState } from 'react';
import { type sortMap, useSortedLists } from '~/hooks/useSortedLists';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const sortingModes = [
  {
    value: 'default',
    label: 'Default',
    icon: <ArrowsUpDownIcon className={'h-6 w-6'} />,
  },
  {
    value: 'alphabetically',
    label: 'Title (A-Z)',
    icon: <TIcon />,
  },
  { value: 'alphabeticallyReverse', label: 'Title (Z-A)', icon: <TIcon /> },
  {
    value: 'lastUpdated',
    label: 'Updated Recently',
    icon: <ArrowPathIcon className={'h-6 w-6'} />,
  },
  {
    value: 'lastUpdatedReverse',
    label: 'Updated Long Ago',
    icon: <ArrowPathIcon className={'h-6 w-6'} />,
  },
  {
    value: 'amount',
    label: 'Most Items',
    icon: <DocumentPlusIcon className={'h-6 w-6'} />,
  },
  {
    value: 'amountReverse',
    label: 'Least Items',
    icon: <DocumentMinusIcon className={'h-6 w-6'} />,
  },
  {
    value: 'amountChecked',
    label: 'Most Checked',
    icon: <DocumentCheckIcon className={'h-6 w-6'} />,
  },
  {
    value: 'amountCheckedReverse',
    label: 'Least Checked',
    icon: <DocumentCheckIcon className={'h-6 w-6'} />,
  },
];

const Lists = () => {
  const [sortingMode, setSortingMode] = useState('default');
  const { data: lists, isPending } = api.lists.getLists.useQuery();
  const showCreateModal = () => {
    void NiceModal.show(CreateListModal);
  };
  const sortedLists = useSortedLists(
    lists,
    sortingMode as keyof typeof sortMap,
  );
  const [parent] = useAutoAnimate();

  if (!lists && isPending) return <ListIndexSkeleton />;

  return (
    <StandardPage>
      <div className="prose">
        <h1>Your lists</h1>
        <div className="divider" />
      </div>
      <CustomDropdown
        items={sortingModes}
        label={
          <div className={'flex flex-row items-center justify-center'}>
            <ArrowsUpDownIcon className={'mr-2 h-6 w-6'} />
            <span className={'text-start'}>
              {sortingMode === 'default'
                ? 'Sort'
                : sortingModes.find((i) => i.value === sortingMode)?.label ??
                  ''}
            </span>
          </div>
        }
        selected={sortingMode}
        setSelected={setSortingMode}
      />
      <div
        className="mb-12 mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3"
        ref={parent}
      >
        {sortedLists.map((list) => (
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
