import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zNewListItemSchema } from '~/schemas/listSchemas';
import { api } from '~/utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ModalHeader } from './ModalHeader';

interface CreateItemModalProps {
  listId: string;
}

export const CreateItemModal = NiceModal.create(
  ({ listId }: CreateItemModalProps) => {
    const modal = useModal();
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zNewListItemSchema>>({
      initialValues: {
        title: '',
        description: '',
        listId: listId,
      },
      validate: zodResolver(zNewListItemSchema),
    });
    const { mutate, isLoading } = api.bucketList.createItem.useMutation({
      onSuccess: () => {
        void modal.remove();
        void utils.lists.getList.invalidate({ id: listId });
      },
    });

    return (
      <ModalHeader title="Add a to-do" modal={modal}>
        <form
          onSubmit={form.onSubmit(({ title, description }) =>
            mutate({ title, description, listId }),
          )}
          className="flex w-3/4 max-w-xs flex-col items-center"
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
          <button
            className={`btn-primary btn mt-5 self-end ${
              isLoading ? 'loading' : ''
            }`}
            type="submit"
          >
            Add To-do
          </button>
        </form>
      </ModalHeader>
    );
  },
);
