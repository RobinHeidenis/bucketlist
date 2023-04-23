import { type ShowListEpisode } from '~/types/List';
import { useState } from 'react';
import { api } from '~/utils/api';

export const Episode = ({
  episode,
  isOwner,
  isCollaborator,
  listId,
}: {
  episode: ShowListEpisode;
  isOwner: boolean;
  isCollaborator: boolean;
  listId: string;
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const context = api.useContext();
  const setEpisodeWatchedMutation = api.showList.setEpisodeWatched.useMutation({
    onSuccess: () => context.lists.getList.invalidate({ id: listId }),
  });

  return (
    <div className="mb-3 flex flex-row justify-between pl-9">
      <div className="flex flex-row">
        <input
          type="checkbox"
          checked={episode.checked}
          className="checkbox mr-3 mt-2"
          onChange={(event) => {
            if (!isOwner && !isCollaborator) {
              event.preventDefault();
              event.target.checked = episode.checked;
              return;
            }
            setEpisodeWatchedMutation.mutate({
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
            {episode.title}
          </h3>
          <p
            className={`
            m-0 
            ${showDescription ? '' : 'line-clamp-2'} 
            ${episode.checked ? 'text-slate-500 line-through' : ''}
          `}
            onClick={() => setShowDescription(!showDescription)}
          >
            {episode.overview}
          </p>
        </div>
      </div>
    </div>
  );
};
