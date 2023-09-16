import { StarIcon } from '@heroicons/react/24/solid';
import {
  CalendarIcon,
  CheckIcon,
  TagIcon,
  TrashIcon,
  TvIcon,
} from '@heroicons/react/24/outline';
import { PosterImage } from '../../movie/PosterImage';
import type { ShowListShow } from '~/types/List';
import { memo, useState } from 'react';
import { Season } from '~/components/list/show/Season';
import { DropdownHeader } from '~/components/dropdown/DropdownHeader';
import { DropdownItem } from '~/components/dropdown/DropdownItem';
import { api } from '~/utils/api';
import { FlexRowCenter } from '~/components/style/FlexRowCenter';
import { type Permissions } from '~/hooks/usePermissionsCheck';
import { showErrorToast } from '~/utils/showErrorToast';

interface ShowProps {
  show: ShowListShow;
  listId: string;
  permissions: Permissions;
  hideDivider?: boolean;
}

const Show = memo(({ listId, permissions, hideDivider, show }: ShowProps) => {
  const [open, setOpen] = useState(false);

  const context = api.useContext();
  const { mutate: deleteShow, isLoading } = api.showList.deleteShow.useMutation(
    {
      onSuccess: () => {
        void context.lists.getList.invalidate({ id: listId });
      },
      onError: showErrorToast,
    },
  );

  return (
    <div
      className={`collapse collapse-arrow max-w-full transition-none ${
        open ? 'collapse-open' : 'collapse-close'
      } overflow-visible`}
    >
      <div
        className={`collapse-title flex flex-row items-start justify-between p-0 after:!right-[0.85rem]`}
        onClick={() => void setOpen(!open)}
      >
        <div className="flex flex-row items-start">
          <PosterImage
            alt={show.title}
            url={show.posterUrl}
            imageHash={show.imageHash ?? null}
            width={80}
            height={120}
            className={`m-0 mr-4 ${show.allChecked ? 'grayscale' : ''}`}
          />
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3
                className={`m-0 ${
                  show.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {show.title}
              </h3>
              <p
                className={`m-0 line-clamp-2 max-w-full ${
                  show.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {show.description}
              </p>
            </div>
            <div className="flex flex-col xsm:grid xsm:grid-cols-2 sm:grid-cols-3 md:flex md:flex-row md:items-center">
              <FlexRowCenter sx="whitespace-nowrap">
                <StarIcon className="mr-1 h-5 w-5 flex-shrink-0 text-amber-500" />{' '}
                {show.rating ? parseFloat(show.rating).toFixed(1) : 'unknown'}
              </FlexRowCenter>
              <FlexRowCenter sx="whitespace-nowrap">
                <CalendarIcon className="mr-1 h-5 w-5 flex-shrink-0 md:ml-2" />
                {show.releaseDate || 'unknown'}
              </FlexRowCenter>
              <FlexRowCenter sx="whitespace-nowrap">
                <TvIcon className="mr-1 h-5 w-5 flex-shrink-0 md:ml-2" />
                {show.seasons.length} seasons
              </FlexRowCenter>
              <FlexRowCenter sx="whitespace-nowrap">
                <CheckIcon className="mr-1 h-5 w-5 flex-shrink-0 md:ml-2" />
                {show.amountChecked} episodes
              </FlexRowCenter>
              {show.genres ? (
                <div
                  className="tooltip col-span-2 flex min-w-0 max-w-full flex-row items-center justify-start"
                  data-tip={show.genres}
                >
                  <TagIcon className="mr-1 h-5 w-5 flex-shrink-0 md:ml-2" />
                  <div className={'whitespace-wrap line-clamp-1 text-start'}>
                    {show.genres}
                  </div>
                </div>
              ) : (
                <>
                  <TagIcon className="mr-1 h-5 w-5 md:ml-2" /> none
                </>
              )}
            </div>
          </div>
        </div>
        {permissions.hasPermissions && (
          <DropdownHeader>
            <DropdownItem
              onClick={() => void deleteShow({ showId: show.id, listId })}
              danger
            >
              <TrashIcon className={`${isLoading ? 'loading' : ''} h-6 w-6`} />
              Delete
            </DropdownItem>
          </DropdownHeader>
        )}
      </div>
      <div
        className={`collapse-content ${
          open ? 'mt-5' : ''
        } overflow-x-visible p-0 sm:ml-24`}
      >
        {show.seasons.map((season) => (
          <div key={season.id}>
            <Season season={season} permissions={permissions} listId={listId} />
          </div>
        ))}
      </div>
      {!hideDivider && <div className="divider mb-2 mt-2" />}
    </div>
  );
});

Show.displayName = 'Show';

export { Show };
