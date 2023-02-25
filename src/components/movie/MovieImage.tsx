import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';
import type { PropsWithClassName } from '../../types/PropsWithClassName';

export const MovieImage = ({
  url,
  alt,
  width = 64,
  height = 91,
  className,
}: PropsWithClassName<{
  url?: string | null;
  alt: string;
  width?: number;
  height?: number;
}>) => {
  if (url)
    return (
      <Image
        src={`https://image.tmdb.org/t/p/w500${url}`}
        alt={alt}
        width={width}
        height={height}
        className={`m-0 mr-4 aspect-[2/3] p-0 ${className ?? ''}`}
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
