import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import { useClickOutside } from '@mantine/hooks';
import type { z } from 'zod';
import { zEditListItemSchema } from '../../schemas/listSchemas';
import { api } from '../../utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ListItem } from '@prisma/client';

export const EditItemModal = NiceModal.create(
  ({
    id,
    title,
    description,
    listId,
  }: Pick<ListItem, 'id' | 'title' | 'description' | 'listId'>) => {
    const modal = useModal();
    const ref = useClickOutside(() => void modal.hide());
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zEditListItemSchema>>({
      initialValues: {
        id,
        title,
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
      <div className={`modal ${modal.visible ? 'modal-open' : ''}`}>
        <div className="modal-box relative" ref={ref}>
          <label
            className="btn-sm btn-circle btn absolute right-2 top-2"
            onClick={() => void modal.hide()}
          >
            ✕
          </label>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-bold">Edit to-do</h3>
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
          </div>
        </div>
      </div>
    );
  },
);
