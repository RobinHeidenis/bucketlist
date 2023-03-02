import type { ListItem, Movie as MovieType } from '@prisma/client';
import { PosterImage } from '../movie/PosterImage';
import { DropdownHeader } from '../dropdown/DropdownHeader';
import { DropdownItem } from '../dropdown/DropdownItem';
import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  FilmIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Movie } from './Movie';
import { api } from '../../utils/api';

interface CollectionProps {
  collection: {
    allChecked: boolean;
    id: number;
    title: string;
    description: string | null;
    posterUrl: string | null;
    items: (ListItem & { movie: MovieType })[];
  };
  isOwner: boolean;
  isCollaborator: boolean;
  listId: string;
}

export const Collection = ({
  collection,
  isOwner,
  isCollaborator,
  listId,
}: CollectionProps) => {
  const context = api.useContext();
  const [open, setOpen] = useState(false);
  const { mutate: deleteCollection } =
    api.listItem.deleteCollection.useMutation({
      onSuccess: () => {
        void context.lists.getList.invalidate({ id: listId });
      },
    });

  const { mutate: setCollectionWatched } =
    api.listItem.setCollectionChecked.useMutation({
      onSuccess: () => {
        void context.lists.getList.invalidate({ id: listId });
      },
    });

  return (
    <div
      className={`collapse ${
        open ? 'collapse-open' : 'collapse-close'
      } overflow-visible`}
    >
      <div
        className="collapse-title flex flex-row items-start justify-between p-0"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-row items-start">
          <PosterImage
            alt={collection.title}
            url={collection.posterUrl}
            width={80}
            height={120}
            className={`m-0 mr-4 ${collection.allChecked ? 'grayscale' : ''}`}
          />
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3
                className={`m-0 ${
                  collection.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {collection.title}
              </h3>
              <p
                className={`m-0 line-clamp-2 ${
                  collection.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {collection.description}
              </p>
            </div>
            <div className="flex flex-row items-center">
              <FilmIcon className="mr-1 h-5 w-5" /> {collection.items.length}{' '}
              movies
              <CheckIcon className="ml-4 mr-1 h-5 w-5" />{' '}
              {collection.items.filter((item) => item.checked).length} seen
            </div>
          </div>
        </div>
        {(isOwner || isCollaborator) && (
          <DropdownHeader>
            <DropdownItem
              onClick={() => {
                setCollectionWatched({
                  id: collection.id,
                  listId,
                  checked: !collection.allChecked,
                });
              }}
            >
              {collection.allChecked ? (
                <>
                  <EyeSlashIcon className="h-6 w-6" /> Mark as unseen
                </>
              ) : (
                <>
                  <EyeIcon className="h-6 w-6" /> mark as seen
                </>
              )}
            </DropdownItem>
            <DropdownItem
              onClick={() => deleteCollection({ id: collection.id, listId })}
              danger
            >
              <TrashIcon className="h-6 w-6" />
              Delete
            </DropdownItem>
          </DropdownHeader>
        )}
      </div>
      <div
        className={`collapse-content ${
          open ? 'mt-5' : ''
        } ml-24 overflow-x-visible p-0`}
      >
        {collection.items.map((item, index) => (
          <Movie
            key={item.id}
            checked={item.checked}
            itemId={item.id}
            listId={listId}
            isOwner={isOwner}
            isCollaborator={isCollaborator}
            dropdownLeft
            hideDivider={index === collection.items.length - 1}
            {...item.movie}
          />
        ))}
      </div>
      <div className="divider mt-2 mb-2" />
    </div>
  );
};
