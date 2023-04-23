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
import { useState } from 'react';
import { Season } from '~/components/list/show/Season';
import { DropdownHeader } from '~/components/dropdown/DropdownHeader';
import { DropdownItem } from '~/components/dropdown/DropdownItem';
import { api } from '~/utils/api';

interface ShowProps {
  show: ShowListShow;
  listId: string;
  isOwner: boolean;
  isCollaborator: boolean;
  dropdownLeft?: boolean;
  hideDivider?: boolean;
}

export const Show = ({
  listId,
  isOwner,
  isCollaborator,
  dropdownLeft,
  hideDivider,
  show,
}: ShowProps) => {
  const [open, setOpen] = useState(false);

  const context = api.useContext();
  const { mutate: deleteShow } = api.showList.deleteShow.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });

  return (
    <div
      className={`collapse-arrow collapse ${
        open ? 'collapse-open' : 'collapse-close'
      } overflow-visible`}
    >
      <div
        className={`collapse-title flex flex-row items-start justify-between p-0 after:!right-[0.85rem]`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-row items-start">
          <PosterImage
            alt={show.title}
            url={show.posterUrl}
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
                className={`m-0 line-clamp-2 ${
                  show.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {show.description}
              </p>
            </div>
            <div className="flex flex-row items-center">
              <StarIcon className="mr-1 h-5 w-5 text-amber-500" /> {show.rating}
              <CalendarIcon className="ml-2 mr-1 h-5 w-5" />{' '}
              {show.releaseDate || 'unknown'}
              <TvIcon className="ml-2 mr-1 h-5 w-5" />
              {show.seasons.length} seasons
              <CheckIcon className={'ml-2 mr-1 h-5 w-5'} />
              {show.amountChecked} episodes
              {show.genres ? (
                <div
                  className="tooltip flex flex-row items-center"
                  data-tip={show.genres}
                >
                  <TagIcon className="ml-2 mr-1 h-5 w-5" />
                  {show.genres?.split(',')[0]}, ...
                </div>
              ) : (
                <>
                  <TagIcon className="ml-2 mr-1 h-5 w-5" /> none
                </>
              )}
            </div>
          </div>
        </div>
        {(isOwner || isCollaborator) && (
          <DropdownHeader left={dropdownLeft}>
            <DropdownItem
              onClick={() => deleteShow({ showId: show.id, listId })}
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
        {show.seasons.map((season) => (
          <div key={season.id}>
            <Season
              season={season}
              isCollaborator={isCollaborator}
              listId={listId}
              isOwner={isOwner}
            />
          </div>
        ))}
      </div>
      {!hideDivider && <div className="divider mb-2 mt-2" />}
    </div>
  );
};
