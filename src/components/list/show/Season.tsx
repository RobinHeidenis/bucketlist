import { useState } from 'react';
import { api } from '~/utils/api';
import { type ShowListSeason } from '~/types/List';
import { Episode } from '~/components/list/show/Episode';
import { CalendarIcon, CheckIcon, TvIcon } from '@heroicons/react/24/outline';
import { FlexRowCenter } from '~/components/style/FlexRowCenter';
import { type Permissions } from '~/hooks/usePermissionsCheck';
import { showErrorToast } from '~/utils/showErrorToast';

export const Season = ({
  season,
  permissions,
  listId,
}: {
  season: ShowListSeason;
  permissions: Permissions;
  listId: string;
}) => {
  const [showChildren, setShowChildren] = useState(false);
  const context = api.useContext();
  const { mutate, isLoading } = api.showList.setSeasonWatched.useMutation({
    onSuccess: () => context.lists.getList.invalidate({ id: listId }),
    onError: showErrorToast,
  });

  return (
    <>
      <div className="mb-3 flex flex-row justify-between">
        <div className="flex flex-row">
          <input
            type="checkbox"
            checked={season.allChecked}
            className={`checkbox mr-3 mt-2 ${isLoading ? 'loading' : ''}`}
            onChange={(event) => {
              if (!permissions.hasPermissions) {
                event.preventDefault();
                event.target.checked = season.allChecked;
                return;
              }
              mutate({
                seasonNumber: season.seasonNumber,
                showId: season.showId,
                listId,
                checked: event.target.checked,
              });
            }}
          />
          <div
            className="flex flex-col"
            onClick={() => void setShowChildren(!showChildren)}
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
                className={`m-0 line-clamp-2 ${
                  season.allChecked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {season.overview}
              </p>
            </div>
            <div className="flex flex-row flex-wrap items-center">
              <FlexRowCenter sx="mr-3">
                <CalendarIcon className="mr-1 h-5 w-5" />
                {season.releaseDate}
              </FlexRowCenter>
              <FlexRowCenter sx="mr-3">
                <TvIcon className="mr-1 h-5 w-5" />
                {season.episodes.length} episodes
              </FlexRowCenter>
              <FlexRowCenter>
                <CheckIcon className={'mr-1 h-5 w-5'} />
                {season.amountChecked} watched
              </FlexRowCenter>
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
              permissions={permissions}
              listId={listId}
            />
          ))}
      </div>
    </>
  );
};
