import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zEditListSchema } from '~/schemas/listSchemas';
import { api } from '~/utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ModalHeader } from './ModalHeader';

export const EditListModal = NiceModal.create(
  ({
    listId,
    title,
    description,
  }: {
    listId: string;
    title: string;
    description: string | null;
  }) => {
    const modal = useModal();
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zEditListSchema>>({
      initialValues: {
        id: listId,
        title,
        description: description || '',
      },
      validate: zodResolver(zEditListSchema),
    });
    const { mutate, isLoading } = api.lists.updateList.useMutation({
      onSuccess: () => {
        void modal.remove();
        void utils.lists.getList.invalidate({ id: listId });
      },
    });

    return (
      <ModalHeader title="Edit list" modal={modal}>
        <form
          onSubmit={form.onSubmit(
            ({ title: newTitle, description: newDescription }) => {
              if (newTitle === title && newDescription === description) {
                void modal.remove();
                return;
              }
              mutate({
                title: newTitle,
                description: newDescription,
                id: listId,
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
