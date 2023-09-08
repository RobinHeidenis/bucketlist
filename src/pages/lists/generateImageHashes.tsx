import { api } from '~/utils/api';
import { StandardPage } from '~/components/page/StandardPage';
import { BoltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { thumbHashToDataURL } from 'thumbhash';

export default function GenerateImageHashes() {
  const { mutate, isLoading, data } =
    api.movieList.generateImageHashesForMovies.useMutation();
  const {
    mutate: generateImageHashesForCollections,
    isLoading: isLoadingCollections,
    data: collectionsData,
  } = api.movieList.generateImageHashesForCollections.useMutation();
  const {
    mutate: generateImageHashesForShows,
    isLoading: isLoadingShows,
    data: showsData,
  } = api.showList.generateImageHashes.useMutation();

  return (
    <StandardPage>
      <div className={'prose'}>
        <h2>Generate image hashes for movies that don&quot;t have one yet</h2>
        <button onClick={() => void mutate()} className="btn btn-primary">
          <BoltIcon className={`h-5 w-5 ${isLoading ? 'loading' : ''}`} />
          Generate
        </button>
        <h2>
          Generate image hashes for collections that don&quot;t have one yet
        </h2>
        <button
          onClick={() => void generateImageHashesForCollections()}
          className="btn btn-primary"
        >
          <BoltIcon
            className={`h-5 w-5 ${isLoadingCollections ? 'loading' : ''}`}
          />
          Generate
        </button>
        <h2>Generate image hashes for shows that don&quot;t have one yet</h2>
        <button
          onClick={() => void generateImageHashesForShows()}
          className="btn btn-primary"
        >
          <BoltIcon className={`h-5 w-5 ${isLoadingShows ? 'loading' : ''}`} />
          Generate
        </button>
        <div className="mt-5 flex flex-col items-start justify-center">
          <h3>Results:</h3>
          {data?.map((movie) => (
            <div
              key={movie.id}
              className={'flex flex-row items-center justify-start'}
            >
              <Image
                src={
                  movie.posterUrl
                    ? `https://image.tmdb.org/t/p/w500${movie.posterUrl}`
                    : ''
                }
                className={'mr-4'}
                alt={'poster'}
                width={80}
                height={120}
              />
              <Image
                src={thumbHashToDataURL(Buffer.from(movie.imageHash, 'binary'))}
                className={'mr-4'}
                alt={'blur'}
                width={80}
                height={120}
              />
              <h1>{movie.title}</h1>
            </div>
          ))}
          {collectionsData?.map((collection) => (
            <div
              key={collection.id}
              className={'flex flex-row items-center justify-start'}
            >
              <Image
                src={
                  collection.posterUrl
                    ? `https://image.tmdb.org/t/p/w500${collection.posterUrl}`
                    : ''
                }
                className={'mr-4'}
                alt={'poster'}
                width={80}
                height={120}
              />
              <Image
                src={thumbHashToDataURL(
                  Buffer.from(collection.imageHash, 'binary'),
                )}
                className={'mr-4'}
                alt={'blur'}
                width={80}
                height={120}
              />
              <h1>{collection.name}</h1>
            </div>
          ))}
          {showsData?.map((show) => (
            <div
              key={show.id}
              className={'flex flex-row items-center justify-start'}
            >
              <Image
                src={
                  show.posterUrl
                    ? `https://image.tmdb.org/t/p/w500${show.posterUrl}`
                    : ''
                }
                className={'mr-4'}
                alt={'poster'}
                width={80}
                height={120}
              />
              <Image
                src={thumbHashToDataURL(Buffer.from(show.imageHash, 'binary'))}
                className={'mr-4'}
                alt={'blur'}
                width={80}
                height={120}
              />
              <h1>{show.title}</h1>
            </div>
          ))}
        </div>
      </div>
    </StandardPage>
  );
}
