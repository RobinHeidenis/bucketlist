import type { ShowList } from '~/types/List';
import { type ShowListEpisode } from '~/types/List';
import { useState } from 'react';
import { api } from '~/utils/api';
import { type Permissions } from '~/hooks/usePermissionsCheck';
import { showErrorToast } from '~/utils/showErrorToast';

export const Episode = ({
  episode,
  permissions,
  listId,
}: {
  episode: ShowListEpisode;
  permissions: Permissions;
  listId: string;
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const context = api.useUtils();
  const { mutate, isPending } = api.showList.setEpisodeWatched.useMutation({
    onSuccess: async () => {
      await context.lists.getList.cancel({ id: listId });
      context.lists.getList.setData({ id: listId }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          shows: (prev as ShowList).shows.map((show) => {
            return {
              ...show,
              seasons: show.seasons.map((season) => {
                return {
                  ...season,
                  episodes: season.episodes.map((ep) => {
                    if (ep.id === episode.id) {
                      return { ...ep, checked: !ep.checked };
                    }
                    return ep;
                  }),
                };
              }),
            };
          }),
        };
      });
      void context.lists.getList.invalidate({ id: listId });
    },
    onError: showErrorToast,
  });

  return (
    <div className="mb-3 flex flex-row justify-between pl-9">
      <div className="flex flex-row">
        <input
          type="checkbox"
          checked={episode.checked}
          className={`checkbox mr-3 mt-2 ${isPending ? 'loading' : ''}`}
          onChange={(event) => {
            if (!permissions.hasPermissions) {
              event.preventDefault();
              event.target.checked = episode.checked;
              return;
            }
            mutate({
              id: episode.id,
              listId,
              checked: event.target.checked,
            });
          }}
        />
        <div className="flex flex-col">
          <h3
            className={`m-0 ${
              episode.checked ? 'text-slate-500 line-through' : ''
            } font-normal`}
          >
            {episode.episodeNumber}. {episode.title}
          </h3>
          <p
            className={`
            m-0 
            ${showDescription ? '' : 'line-clamp-2'} 
            ${episode.checked ? 'text-slate-500 line-through' : ''}
          `}
            onClick={() => void setShowDescription(!showDescription)}
          >
            {episode.overview}
          </p>
        </div>
      </div>
    </div>
  );
};
