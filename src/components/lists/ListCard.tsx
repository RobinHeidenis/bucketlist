import type { List, ListItem } from '@prisma/client';
import { ListCardWrapper } from './ListCardWrapper';
import { useRouter } from 'next/router';

interface ListCardProps {
  list: List & { items: ListItem[] };
}

export const ListCard = ({ list }: ListCardProps) => {
  const router = useRouter();

  return (
    <ListCardWrapper onClick={() => void router.push(`/lists/${list.id}`)}>
      <h2 className="card-title line-clamp-2">{list.title}</h2>
      <p className={`line-clamp-${list.title.length > 21 ? '2' : '3'}`}>
        {list.description}
      </p>
      <div className="card-actions">
        <p>
          {list.items?.length} items •{' '}
          {list.items.filter((item) => item.checked).length} checked
        </p>
      </div>
    </ListCardWrapper>
  );
};
