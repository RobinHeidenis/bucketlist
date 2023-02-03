import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import { useClickOutside } from '@mantine/hooks';
import type { z } from 'zod';
import { zNewListItemSchema } from '../../schemas/listSchemas';
import { api } from '../../utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';

interface CreateItemModalProps {
  listId: string;
}

export const CreateItemModal = NiceModal.create(
  ({ listId }: CreateItemModalProps) => {
    const modal = useModal();
    const ref = useClickOutside(() => void modal.hide());
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zNewListItemSchema>>({
      initialValues: {
        title: '',
        description: '',
        listId: listId,
      },
      validate: zodResolver(zNewListItemSchema),
    });
    const { mutate, isLoading } = api.listItem.createItem.useMutation({
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
            <h3 className="text-lg font-bold">Add a to-do</h3>
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
          </div>
        </div>
      </div>
    );
  },
);
