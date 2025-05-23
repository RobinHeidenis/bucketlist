import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zNewListItemSchema } from '~/schemas/listSchemas';
import { api } from '~/utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ModalHeader } from './ModalHeader';
import { showErrorToast } from '~/utils/showErrorToast';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { BucketList } from '~/types/List';

interface CreateItemModalProps {
  listId: string;
}

export const CreateItemModal = NiceModal.create(
  ({ listId }: CreateItemModalProps) => {
    const modal = useModal();
    const utils = api.useUtils();
    const form = useForm<z.infer<typeof zNewListItemSchema>>({
      initialValues: {
        title: '',
        description: '',
        listId: listId,
      },
      validate: zodResolver(zNewListItemSchema),
    });
    const { mutate, isPending } = api.bucketList.createItem.useMutation({
      onSuccess: () => {
        void modal.remove();
        utils.lists.getList.setData({ id: listId }, (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            bucketListItems: [
              ...(prev as BucketList).bucketListItems,
              {
                title: form.values.title,
                description: form.values.description ?? null,
                id: 'temp',
                listId,
                updatedAt: new Date(),
                checked: false,
              },
            ].sort((a, b) => (a.title > b.title ? 1 : -1)),
          };
        });
        void utils.lists.getList.invalidate({ id: listId });
      },
      onError: showErrorToast,
    });

    return (
      <ModalHeader title="Add a to-do" modal={modal}>
        <form
          onSubmit={form.onSubmit(
            ({ title, description }) =>
              void mutate({ title, description, listId }),
          )}
          className="flex w-full max-w-xs flex-col items-center pl-3 pr-3 xsm:w-3/4"
        >
          <TextInput
            label="Title"
            placeholder="Picnic at the Eiffel Tower"
            required
            error={form.errors.title}
            inputClassName="max-w-xs"
            className="mt-3"
            {...form.getInputProps('title')}
          />
          <TextArea
            label="Description"
            placeholder="Visit the Eiffel Tower in Paris and have a picnic there."
            {...form.getInputProps('description')}
          />
          <button className={'btn btn-primary mt-5 self-end'} type="submit">
            <PlusIcon className={`h-5 w-5 ${isPending ? 'loading' : ''}`} />
            Add To-do
          </button>
        </form>
      </ModalHeader>
    );
  },
);
