import { useState } from 'react';
import type { z } from 'zod';
import type { TMDBSearchCollection, TMDBSearchMovie } from '~/types/TMDBMovie';
import { type TMDBSearchTVShow } from '~/types/TMDBMovie';
import { MovieResult } from './MovieResult';
import { CollectionResult } from './CollectionResult';
import { ShowResult } from '~/components/form/ShowResult';

type PossibleResultTypes =
  | (z.infer<typeof TMDBSearchMovie> | z.infer<typeof TMDBSearchCollection>)
  | z.infer<typeof TMDBSearchTVShow>;

interface AutocompleteProps<TResult extends PossibleResultTypes> {
  value: string;
  onChange: (value: string) => void;
  setSelectedResult: (value: TResult | null) => void;
  items: TResult[];
  isLoading: boolean;
  hasHiddenItems: boolean;
}

export const Autocomplete = <TResult extends PossibleResultTypes>({
  value,
  onChange,
  items,
  setSelectedResult,
  isLoading,
  hasHiddenItems,
}: AutocompleteProps<TResult>) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`dropdown-end dropdown z-40 mt-3 w-full ${
        open ? 'dropdown-open' : ''
      }`}
    >
      <input
        type="text"
        className="input input-bordered input-ghost w-full"
        value={value}
        onChange={(e) => void onChange(e.target.value)}
        placeholder="Cars 2"
        tabIndex={0}
      />
      <div className="dropdown-content top-14 max-h-96 w-full flex-col overflow-auto rounded-md bg-base-100">
        <ul className="menu menu-compact m-0 mt-2 flex-grow p-0">
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
        {hasHiddenItems && (
          <div className="sticky bottom-0 flex items-center justify-center bg-base-100 p-1">
            Some results have been hidden due to them already being in the list.
          </div>
        )}
      </div>
    </div>
  );
};
