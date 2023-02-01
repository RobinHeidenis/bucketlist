import type { ListItem as ListItemType } from '@prisma/client';
import { useRef, useState } from 'react';
import { api } from '../../utils/api';
import { DropdownMenu } from './DropdownMenu';
import toast from 'react-hot-toast';
import { ErrorToast } from '../toasts/ErrorToast';

export const ListItem = ({ id, checked, title, description }: ListItemType) => {
  const [showDescription, setShowDescription] = useState(false);
  const context = api.useContext();
  const ref = useRef<HTMLInputElement>(null);
  const { mutate } = api.listItem.setItemChecked.useMutation({
    onSuccess: () => context.lists.getList.invalidate(),
    onError: () => {
      if (!ref.current) return;
      ref.current.checked = !ref.current.checked;
      toast.custom(
        <ErrorToast message="Something went wrong checking or unchecking this item. Please try again later!" />,
      );
    },
  });

  return (
    <div className="mb-3 flex flex-row justify-between">
      <div className="flex flex-row">
        <input
          ref={ref}
          type="checkbox"
          defaultChecked={checked}
          className="checkbox mr-3 mt-2"
          onChange={(event) =>
            mutate({
              id,
              checked: event.target.checked,
            })
          }
        />
        <div className="flex flex-col">
          <h3 className={`m-0 ${checked ? 'text-slate-500 line-through' : ''}`}>
            {title}
          </h3>
          <p
            className={`
            m-0 
            ${showDescription ? '' : 'line-clamp-2'} 
            ${checked ? 'text-slate-500 line-through' : ''}
          `}
            onClick={() => setShowDescription(!showDescription)}
          >
            {description}
          </p>
        </div>
      </div>
      <DropdownMenu
        editOnClick={() => console.log()}
        deleteOnClick={() => console.log()}
        className="self-center"
      />
    </div>
  );
};
