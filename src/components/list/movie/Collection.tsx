import { PosterImage } from '../../movie/PosterImage';
import { DropdownHeader } from '../../dropdown/DropdownHeader';
import { DropdownItem } from '../../dropdown/DropdownItem';
import {
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  FilmIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { CSSProperties } from 'react';
import { memo, useState } from 'react';
import { Movie } from './Movie';
import { api } from '~/utils/api';
import type { MovieListCollection } from '~/types/List';
import { type Permissions } from '~/hooks/usePermissionsCheck';
import { showErrorToast } from '~/utils/showErrorToast';

interface CollectionProps {
  collection: MovieListCollection;
  permissions: Permissions;
  listId: string;
  style?: CSSProperties;
}

const Collection = memo(
  ({ collection, permissions, listId, style }: CollectionProps) => {
    const context = api.useUtils();
    const [open, setOpen] = useState(false);
    const { mutate: deleteCollection, isPending: isDeleteCollectionLoading } =
      api.movieList.deleteCollection.useMutation({
        onSuccess: () => context.lists.getList.invalidate({ id: listId }),
        onError: showErrorToast,
      });

    const {
      mutate: setCollectionWatched,
      isPending: isSetCollectionWatchedLoading,
    } = api.movieList.setCollectionChecked.useMutation({
      onSuccess: () => context.lists.getList.invalidate({ id: listId }),
      onError: showErrorToast,
    });

    return (
      <div
        className={`collapse collapse-arrow transition-none ${
          open ? 'collapse-open' : 'collapse-close'
        } overflow-visible`}
        style={style}
      >
        <div
          className="collapse-title flex flex-row items-start justify-between p-0 after:!right-[0.85rem] after:!top-16"
          onClick={() => void setOpen(!open)}
        >
          <div className="flex flex-row items-start">
            <PosterImage
              alt={collection.name}
              url={collection.posterUrl}
              imageHash={collection.imageHash ?? null}
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
                  {collection.name}
                </h3>
                <p
                  className={`m-0 line-clamp-2 ${
                    collection.allChecked ? 'text-slate-500 line-through' : ''
                  }`}
                >
                  {collection.overview}
                </p>
              </div>
              <div className="flex flex-row items-center">
                <FilmIcon className="mr-1 h-5 w-5" /> {collection.movies.length}{' '}
                movies
                <CheckIcon className="ml-4 mr-1 h-5 w-5" />{' '}
                {collection.amountChecked} seen
              </div>
            </div>
          </div>
          {permissions.hasPermissions && (
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
                    <EyeSlashIcon
                      className={`${
                        isSetCollectionWatchedLoading ? 'loading' : ''
                      } h-6 w-6`}
                    />{' '}
                    Mark as unseen
                  </>
                ) : (
                  <>
                    <EyeIcon
                      className={`${
                        isSetCollectionWatchedLoading ? 'loading' : ''
                      } h-6 w-6`}
                    />{' '}
                    Mark as seen
                  </>
                )}
              </DropdownItem>
              <DropdownItem
                onClick={() =>
                  void deleteCollection({ id: collection.id, listId })
                }
                danger
              >
                <TrashIcon
                  className={`${
                    isDeleteCollectionLoading ? 'loading' : ''
                  } h-6 w-6`}
                />
                Delete
              </DropdownItem>
            </DropdownHeader>
          )}
        </div>
        <div
          className={`collapse-content ${
            open ? 'mt-5' : ''
          } ml-7 overflow-x-visible p-0 sm:ml-24`}
        >
          {open &&
            collection.movies.map((item, index) => (
              <Movie
                key={item.id}
                listId={listId}
                permissions={permissions}
                hideDivider={index === collection.movies.length - 1}
                movie={item}
                inCollection
              />
            ))}
        </div>
        <div className="divider mb-2 mt-2" />
      </div>
    );
  },
);

Collection.displayName = 'Collection';

export { Collection };
