import {
  type ShowList,
  type ShowListSeason,
  type ShowListShow,
} from '~/types/List';
import { type ListBase } from '~/server/api/routers/lists/utils/getListBase';
import { convertImageHash } from '~/server/api/routers/utils/convertImageHash';
import { type prisma } from '~/server/db';

export const getShowList = (db: typeof prisma, id: string) =>
  db.list.findUnique({
    where: { id },
    include: {
      shows: { include: { seasons: { include: { episodes: true } } } },
      checkedEpisodes: true,
      owner: { select: { id: true } },
      collaborators: { select: { id: true } },
    },
  });

const getUpdatedEpisodes = (
  season: ShowListSeason,
  checkedEpisodesSet: Set<number>,
) => {
  return season.episodes
    .map((episode) => ({
      ...episode,
      checked: checkedEpisodesSet.has(episode.id),
    }))
    .sort((a, b) => a.episodeNumber - b.episodeNumber);
};

const updateSeason = (
  season: ShowListSeason,
  checkedEpisodesSet: Set<number>,
) => {
  const updatedEpisodes = getUpdatedEpisodes(season, checkedEpisodesSet);

  const allChecked = updatedEpisodes.every((episode) => episode.checked);
  const amountChecked = updatedEpisodes.filter(
    (episode) => episode.checked,
  ).length;

  return { ...season, episodes: updatedEpisodes, allChecked, amountChecked };
};

const getUpdatedSeasons = (
  show: ShowListShow,
  checkedEpisodesSet: Set<number>,
) => {
  let showTotal = 0;
  let showTotalChecked = 0;

  const seasons = show.seasons
    .map((season) => {
      const updatedSeason = updateSeason(season, checkedEpisodesSet);

      showTotal += season.episodes.length;
      showTotalChecked += updatedSeason.amountChecked;

      return updatedSeason;
    })
    .filter((season) => season.episodes.length > 0)
    .sort((a, b) => a.seasonNumber - b.seasonNumber);

  return { seasons, showTotal, showTotalChecked };
};

export const formatShowList = (list: ShowList, base: ListBase): ShowList => {
  const { checkedEpisodes, shows, updatedAt } = list;
  const checkedEpisodesSet = new Set(checkedEpisodes.map((e) => e.episodeId));

  let total = 0;
  let totalChecked = 0;

  const updatedShows = shows.map((show) => {
    const { seasons, showTotal, showTotalChecked } = getUpdatedSeasons(
      show,
      checkedEpisodesSet,
    );

    total += showTotal;
    totalChecked += showTotalChecked;

    const allChecked = seasons.every((season) => season.allChecked);

    return {
      ...show,
      imageHash: convertImageHash(show.imageHash),
      seasons,
      allChecked,
      amountChecked: showTotalChecked,
    };
  });

  console.log(
    shows
      .map((show) => show.seasons.map((season) => season.id).join(', '))
      .join(', '),
  );

  return {
    ...base,
    checkedEpisodes,
    shows: updatedShows,
    total,
    totalChecked,
    updatedAt,
  };
};
