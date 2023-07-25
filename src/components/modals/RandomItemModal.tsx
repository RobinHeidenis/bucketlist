import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { ModalHeader } from './ModalHeader';
import type {
  MovieListCollection,
  MovieListMovie,
  ShowListShow,
} from '~/types/List';
import { RandomTitle } from '~/components/list/RandomTitle';

export const RandomItemModal = NiceModal.create(
  ({
    items,
  }: {
    items: (MovieListMovie | MovieListCollection)[] | ShowListShow[];
  }) => {
    const modal = useModal();

    return (
      <ModalHeader title="Random title" modal={modal}>
        <RandomTitle titles={items} />
      </ModalHeader>
    );
  },
);
