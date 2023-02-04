import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import { useClickOutside } from '@mantine/hooks';
import type { z } from 'zod';
import { zEditListSchema } from '../../schemas/listSchemas';
import { api } from '../../utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import type { List } from '@prisma/client';

export const EditListModal = NiceModal.create(
  ({ id, title, description }: Pick<List, 'id' | 'title' | 'description'>) => {
    const modal = useModal();
    const ref = useClickOutside(() => void modal.hide());
    const utils = api.useContext();
    const form = useForm<z.infer<typeof zEditListSchema>>({
      initialValues: {
        id,
        title,
        description: description || '',
      },
      validate: zodResolver(zEditListSchema),
    });
    const { mutate, isLoading } = api.lists.updateList.useMutation({
      onSuccess: () => {
        void modal.remove();
        void utils.lists.getList.invalidate({ id });
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
            <h3 className="text-lg font-bold">Edit list</h3>
            <form
              onSubmit={form.onSubmit(
                ({ title: newTitle, description: newDescription }) => {
                  if (newTitle === title && newDescription === description) {
                    void modal.remove();
                    return;
                  }
                  mutate({ title: newTitle, description: newDescription, id });
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
                placeholder="All the things I would still like to do before I die."
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
