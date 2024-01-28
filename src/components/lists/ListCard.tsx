import { ListCardWrapper } from './ListCardWrapper';
import React from 'react';
import { UsersIcon } from '@heroicons/react/24/outline';

interface ListCardProps {
  id: string;
  title: string;
  description: string | null;
  role: 'owner' | 'contributor';
  amount: number;
  amountChecked: number;
}

export const ListCard = ({
  id,
  title,
  description,
  role,
  amount,
  amountChecked,
}: ListCardProps) => {
  return (
    <ListCardWrapper href={`/lists/${id}`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <h2 className="card-title line-clamp-2">{title}</h2>
          <p className={`line-clamp-${title.length > 21 ? '2' : '3'} mt-1`}>
            {description}
          </p>
        </div>
        <div className="card-actions flex items-center">
          <p className="line-clamp-3">
            {amount} items • {amountChecked} checked
          </p>
          {role === 'contributor' && (
            <div className="tooltip" data-tip="Collaborator">
              <UsersIcon className="ml-2 h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    </ListCardWrapper>
  );
};
