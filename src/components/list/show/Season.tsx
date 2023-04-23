import { useState } from 'react';
import { api } from '~/utils/api';
import { type ShowListSeason } from '~/types/List';
import { Episode } from '~/components/list/show/Episode';
import { CalendarIcon, CheckIcon, TvIcon } from '@heroicons/react/24/outline';

export const Season = ({
  season,
  isOwner,
  isCollaborator,
  listId,
}: {
  season: ShowListSeason;
  isOwner: boolean;
  isCollaborator: boolean;
  listId: string;
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const context = api.useContext();
  const setSeasonCheckedMutation = api.showList.setSeasonWatched.useMutation({
    onSuccess: () => context.lists.getList.invalidate({ id: listId }),
  });

  return (
    <>
      <div className="mb-3 flex flex-row justify-between">
        <div className="flex flex-row">
          <input
            type="checkbox"
            checked={season.allChecked}
            className="checkbox mr-3 mt-2"
            onChange={(event) => {
              if (!isOwner && !isCollaborator) {
                event.preventDefault();
                event.target.checked = season.allChecked;
                return;
              }
              setSeasonCheckedMutation.mutate({
                seasonNumber: season.seasonNumber,
                showId: season.showId,
                listId,
                checked: event.target.checked,
              });
            }}
          />
          <div
            className="flex flex-col"
            onClick={() => setShowChildren(!showChildren)}
          >
            <div>
              <h3
                className={`m-0 ${
                  season.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {season.title}
              </h3>
              <p
                className={`
            m-0 
            ${showDescription ? '' : 'line-clamp-2'} 
            ${season.allChecked ? 'text-slate-500 line-through' : ''}
          `}
              >
                {season.overview}
              </p>
            </div>
            <div className={'flex flex-row items-center'}>
              <CalendarIcon className="mr-1 h-5 w-5" />
              {season.releaseDate}
              <TvIcon className="ml-3 mr-1 h-5 w-5" />
              {season.episodes.length} episodes
              <CheckIcon className={'ml-3 mr-1 h-5 w-5'} />
              {season.amountChecked} watched
            </div>
          </div>
        </div>
      </div>
      <div className={`collapse-content ${showChildren ? 'mt-5' : ''} p-0`}>
        {showChildren &&
          season.episodes.map((episode) => (
            <Episode
              key={episode.id}
              episode={episode}
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              listId={listId}
            />
          ))}
      </div>
    </>
  );
};
