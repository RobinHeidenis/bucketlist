import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import { useClickOutside } from '@mantine/hooks';
import type { z } from 'zod';
import { zNewListSchema } from '../../schemas/newListSchema';
import { api } from '../../utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';

export const CreateListModal = NiceModal.create(() => {
  const modal = useModal();
  const ref = useClickOutside(() => void modal.hide());
  const utils = api.useContext();
  const form = useForm<z.infer<typeof zNewListSchema>>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: zodResolver(zNewListSchema),
  });
  const { mutate, isLoading } = api.lists.createList.useMutation({
    onSuccess: () => {
      void modal.remove();
      void utils.lists.getLists.invalidate();
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
          <h3 className="text-lg font-bold">Create a new list</h3>
          <form
            onSubmit={form.onSubmit(({ title, description }) =>
              mutate({ title, description }),
            )}
            className="flex w-3/4 flex-col items-center"
          >
            <TextInput
              label="Title"
              placeholder="Before dying"
              required
              error={form.errors.title}
              {...form.getInputProps('title')}
            />
            <TextArea
              label="Description"
              placeholder="All the things I would still like to do before I die."
              {...form.getInputProps('description')}
            />
            <button
              className={`btn-primary btn mt-5 mr-3 self-end ${
                isLoading ? 'loading' : ''
              }`}
              type="submit"
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});
