import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { PropsWithClassName } from '~/types/PropsWithClassName';
import { thumbHashToDataURL } from 'thumbhash';

export const PosterImage = ({
  url,
  alt,
  width = 64,
  height = 91,
  noMargin = false,
  imageHash,
  className,
}: PropsWithClassName<{
  alt: string;
  url?: string | null;
  width?: number;
  height?: number;
  noMargin?: boolean;
  imageHash?: Uint8Array | null;
}>) => {
  if (url)
    return (
      <Image
        src={`https://image.tmdb.org/t/p/w500${url}`}
        alt={alt}
        width={width}
        height={height}
        placeholder={imageHash ? 'blur' : 'empty'}
        blurDataURL={imageHash ? thumbHashToDataURL(imageHash) : undefined}
        className={`m-0 ${noMargin ? '' : 'mr-4'} aspect-[2/3] p-0 ${
          className ?? ''
        }`}
        style={{ height, width }}
        unoptimized
      />
    );

  return (
    <div
      className="h-30 m-0 mr-4 flex h-24 w-16 items-center justify-center bg-slate-800"
      style={{ height, width }}
    >
      <PhotoIcon className={`mr-0 w-12 text-amber-500 ${className ?? ''}`} />
    </div>
  );
};
