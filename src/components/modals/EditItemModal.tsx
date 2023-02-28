import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zEditListItemSchema } from '../../schemas/listSchemas';
import { api } from '../../utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import type { ListItem } from '@prisma/client';
import { ModalHeader } from './ModalHeader';

export const EditItemModal = NiceModal.create(
  ({
    id,
    title,
    description,
    listId,
  }: Pick<ListItem, 'id' | 'title' | 'description' | 'listId'>) => {
    const modal = useModal();
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zEditListItemSchema>>({
      initialValues: {
        id,
        title: title ?? '',
        description: description ?? '',
      },
      validate: zodResolver(zEditListItemSchema),
    });
    const { mutate, isLoading } = api.listItem.updateItem.useMutation({
      onSuccess: () => {
        void modal.remove();
        void utils.lists.getList.invalidate({ id: listId });
      },
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
              mutate({ id, title: newTitle, description: newDescription });
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
          <button
            className={`btn-primary btn mt-5 self-end ${
              isLoading ? 'loading' : ''
            }`}
            type="submit"
          >
            Save
          </button>
        </form>
      </ModalHeader>
    );
  },
);
