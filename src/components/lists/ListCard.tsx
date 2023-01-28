import type { List, ListItem } from '@prisma/client';
import { ListCardWrapper } from './ListCardWrapper';

interface ListCardProps {
  list: List & { items: ListItem[] };
}

export const ListCard = ({ list }: ListCardProps) => {
  return (
    <ListCardWrapper>
      <h2 className="card-title">{list.title}</h2>
      <p className="line-clamp-3">{list.description}</p>
      <div className="card-actions">
        <p>
          {list.items?.length} items |{' '}
          {list.items.filter((item) => item.checked).length} checked
        </p>
      </div>
    </ListCardWrapper>
  );
};
