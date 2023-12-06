import { type TRPCContext } from '~/server/api/trpc';
import { getShow } from '~/server/TMDB/getShow';
import { getSeasons } from '~/server/TMDB/getSeason';
import { propOrUnknown } from '~/utils/propOrUnknown';
import { convertImageToHash } from '~/utils/convertImageToHash';
import { TRPCError } from '@trpc/server';

export const getAndUpdateOrCreateShow = async (
  prisma: TRPCContext['prisma'],
  showId: number,
) => {
  const { result, eTag } = await getShow(showId);
  const seasons = await getSeasons(showId, result.number_of_seasons ?? 1);

  try {
    await prisma.show.upsert({
      where: { id: showId },
      create: {
        id: showId,
        title: result.name,
        description: result.overview,
        genres: result.genres?.map((g) => g.name).join(', ') ?? '',
        rating: propOrUnknown(result.vote_average?.toString()),
        posterUrl: result.poster_path,
        imageHash: await convertImageToHash(result.poster_path),
        releaseDate: propOrUnknown(result.first_air_date),
        etag: eTag,
        updatedAt: new Date(),
      },
      update: {
        title: result.name,
        description: result.overview,
        genres: result.genres?.map((g) => g.name).join(', ') ?? '',
        rating: propOrUnknown(result.vote_average?.toString()),
        posterUrl: result.poster_path,
        imageHash: await convertImageToHash(result.poster_path),
        releaseDate: propOrUnknown(result.first_air_date),
        etag: eTag,
        updatedAt: new Date(),
      },
    });

    await Promise.all(
      seasons.result.map((s) => {
        return prisma.season.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            seasonNumber: s.season_number ?? 0,
            title: s.name,
            overview: s.overview,
            posterUrl: s.poster_path,
            releaseDate: propOrUnknown(s.air_date),
            show: { connect: { id: showId } },
          },
          update: {
            title: s.name,
            overview: s.overview,
            posterUrl: s.poster_path,
            releaseDate: propOrUnknown(s.air_date),
            seasonNumber: s.season_number ?? 0,
          },
        });
      }),
    );

    await Promise.all(
      seasons.result.flatMap(
        (s) =>
          s.episodes?.map((e) =>
            prisma.episode.upsert({
              where: { id: e.id },
              create: {
                id: e.id,
                episodeNumber: e.episode_number,
                title: e.name,
                overview: e.overview?.slice(0, 999),
                releaseDate: propOrUnknown(e.air_date),
                season: { connect: { id: s.id } },
              },
              update: {
                title: e.name,
                overview: e.overview?.slice(0, 999),
                releaseDate: propOrUnknown(e.air_date),
              },
            }),
          ) ?? [],
      ),
    );
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message:
        'Something went wrong creating or updating your show. Please inform the developer of this',
      cause: e,
    });
  }
};
