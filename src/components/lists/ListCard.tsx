import type { List, ListItem, User, MovieList, Movie } from '@prisma/client';
import { ListCardWrapper } from './ListCardWrapper';
import { useSession } from 'next-auth/react';
import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';

type BucketListType = List & { items: ListItem[]; collaborators: User[] };
type MovieListType = MovieList & { items: Movie[]; collaborators: User[] };

interface ListCardProps {
  list: BucketListType | MovieListType;
}

export const ListCard = ({ list }: ListCardProps) => {
  const { data } = useSession();

  return (
    <ListCardWrapper href={`/lists/${list.id}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <h2 className="card-title line-clamp-2">{list.title}</h2>
          <p
            className={`line-clamp-${list.title.length > 21 ? '2' : '3'} mt-1`}
          >
            {list.description}
          </p>
        </div>
        <div className="card-actions flex items-center">
          <p className="line-clamp-3">
            {list.items?.length} items •{' '}
            {list.items.filter((item) => item.checked).length} checked
          </p>
          {list.collaborators?.some((collaborator) => collaborator.id === data?.user?.id) && (
            <div className="tooltip" data-tip="Collaborator">
              <UsersIcon className="ml-2 h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </ListCardWrapper>
  );
};
