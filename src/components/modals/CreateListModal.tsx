import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { useForm, zodResolver } from '@mantine/form';
import type { z } from 'zod';
import { zNewListSchema } from '~/schemas/listSchemas';
import { api } from '~/utils/api';
import { TextInput } from '../form/TextInput';
import { TextArea } from '../form/TextArea';
import { ModalHeader } from './ModalHeader';
import { showErrorToast } from '~/utils/showErrorToast';
import { PlusIcon } from '@heroicons/react/24/outline';

export const CreateListModal = NiceModal.create(() => {
  const modal = useModal();
  const utils = api.useUtils();
  const form = useForm<z.infer<typeof zNewListSchema>>({
    initialValues: {
      title: '',
      description: '',
      type: 'BUCKET',
    },
    validate: zodResolver(zNewListSchema),
  });
  const { mutate, isPending } = api.lists.createList.useMutation({
    onSuccess: () => {
      void modal.remove();
      void utils.lists.getLists.invalidate();
    },
    onError: showErrorToast,
  });

  return (
    <ModalHeader title="Create a new list" modal={modal}>
      <form
        onSubmit={form.onSubmit(
          ({ title, description, type }) =>
            void mutate({ title, description, type }),
        )}
        className="flex w-3/4 max-w-xs flex-col items-center"
      >
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">
              List type <span className="text-red-500">*</span>
            </span>
          </label>
          <select
            className="select select-bordered w-full max-w-xs"
            {...form.getInputProps('type')}
          >
            <option value="BUCKET">Bucket list</option>
            <option value="MOVIE">Movie list</option>
            <option value="SHOW">Show list</option>
          </select>
        </div>
        <TextInput
          label="Title"
          placeholder="Before dying"
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
        <button className="btn btn-primary mr-3 mt-5 self-end" type="submit">
          <PlusIcon className={`h-5 w-5 ${isPending ? 'loading' : ''}`} />
          Create
        </button>
      </form>
    </ModalHeader>
  );
});
