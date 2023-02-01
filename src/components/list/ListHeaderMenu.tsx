import type { List, ListItem, User } from '@prisma/client';
import { DropdownMenu } from './DropdownMenu';

export const ListHeaderMenu = ({
  owner,
  items,
}: List & { owner: User; items: ListItem[] }) => {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <p className="m-0">
        List by {owner.name} • {items.length} todo&apos;s
      </p>
      <DropdownMenu
        editOnClick={() => console.log()}
        deleteOnClick={() => console.log()}
      />
    </div>
  );
};
