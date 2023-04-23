import { useState } from 'react';
import type { z } from 'zod';
import type { TMDBSearchCollection, TMDBSearchMovie } from '~/types/TMDBMovie';
import { type TMDBSearchTVShow } from '~/types/TMDBMovie';
import { MovieResult } from './MovieResult';
import { CollectionResult } from './CollectionResult';
import { ShowResult } from '~/components/form/ShowResult';

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  setSelectedResult: (value: any) => void;
  items: (
    | z.infer<typeof TMDBSearchMovie>
    | z.infer<typeof TMDBSearchCollection>
    | z.infer<typeof TMDBSearchTVShow>
  )[];
  isLoading: boolean;
}

export const Autocomplete = ({
  value,
  onChange,
  items,
  setSelectedResult,
  isLoading,
}: AutocompleteProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`dropdown-end dropdown mt-3 w-full ${
        open ? 'dropdown-open' : ''
      }`}
    >
      <input
        type="text"
        className="input-bordered input-ghost input w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cars 2"
        tabIndex={0}
      />
      <div className="dropdown-content top-14 max-h-96 w-full flex-col overflow-auto rounded-md bg-base-200">
        <ul className="menu menu-compact m-0 mt-2 p-0">
          {items.length === 0 && (
            <li className="m-0 w-full border-b border-b-base-content/10 p-0">
              <div className="flex flex-row items-center justify-center">
                <p className="m-0">No results found</p>
              </div>
            </li>
          )}
          {isLoading && (
            <li className="m-0 w-full border-b border-b-base-content/10 p-0">
              <div className="flex flex-row items-center justify-center">
                <p className="m-0">Loading...</p>
              </div>
            </li>
          )}
          {items.map((item, index) => {
            return (
              <li
                key={index}
                tabIndex={index + 1}
                onClick={() => {
                  onChange('title' in item ? item.title : item.name);
                  setSelectedResult(item);
                  setOpen(false);
                }}
                className="m-0 w-full border-b border-b-base-content/10 p-0"
              >
                {'title' in item ? (
                  <MovieResult movie={item} />
                ) : 'first_air_date' in item ? (
                  <ShowResult show={item} />
                ) : (
                  <CollectionResult result={item} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
