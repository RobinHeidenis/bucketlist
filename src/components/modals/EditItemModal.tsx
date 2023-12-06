import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zEditListItemSchema } from '~/schemas/listSchemas';
import { api } from '~/utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ModalHeader } from './ModalHeader';
import { showErrorToast } from '~/utils/showErrorToast';
import { CheckIcon } from '@heroicons/react/24/outline';

export const EditItemModal = NiceModal.create(
  ({
    itemId,
    title,
    description,
    listId,
  }: {
    itemId: string;
    listId: string;
    title: string;
    description: string | null;
  }) => {
    const modal = useModal();
    const utils = api.useUtils();
    const form = useForm<z.infer<typeof zEditListItemSchema>>({
      initialValues: {
        id: itemId,
        title: title,
        description: description ?? '',
        listId,
      },
      validate: zodResolver(zEditListItemSchema),
    });
    const { mutate, isLoading } = api.bucketList.updateItem.useMutation({
      onSuccess: () => {
        void modal.remove();
        void utils.lists.getList.invalidate({ id: listId });
      },
      onError: showErrorToast,
    });

    return (
      <ModalHeader title="Edit to-do" modal={modal}>
        <form
          onSubmit={form.onSubmit(
            ({ title: newTitle, description: newDescription }) => {
              if (newTitle === title && newDescription === description) {
                modal.remove();
                return;
              }
              mutate({
                id: itemId,
                title: newTitle,
                description: newDescription,
                listId,
              });
            },
          )}
          className="flex w-3/4 max-w-xs flex-col items-center"
        >
          <TextInput
            label="Title"
            required
            error={form.errors.title}
            inputClassName="max-w-xs"
            className="mt-3"
            {...form.getInputProps('title')}
          />
          <TextArea
            label="Description"
            {...form.getInputProps('description')}
          />
          <button className="btn btn-primary mt-5 self-end" type="submit">
            <CheckIcon className={`h-5 w-5 ${isLoading ? 'loading' : ''}`} />
            Save
          </button>
        </form>
      </ModalHeader>
    );
  },
);
