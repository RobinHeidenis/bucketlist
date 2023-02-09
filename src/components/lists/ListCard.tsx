import type { List, ListItem } from '@prisma/client';
import { ListCardWrapper } from './ListCardWrapper';

interface ListCardProps {
  list: List & { items: ListItem[] };
}

export const ListCard = ({ list }: ListCardProps) => (
  <ListCardWrapper href={`/lists/${list.id}`}>
    <h2 className="card-title line-clamp-2">{list.title}</h2>
    <p className={`line-clamp-${list.title.length > 21 ? '2' : '3'}`}>
      {list.description}
    </p>
    <div className="card-actions">
      <p className="line-clamp-3">
        {list.items?.length} items •{' '}
        {list.items.filter((item) => item.checked).length} checked
      </p>
    </div>
  </ListCardWrapper>
);
