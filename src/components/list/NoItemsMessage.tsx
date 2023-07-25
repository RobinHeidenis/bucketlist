import { type Permissions } from '~/hooks/usePermissionsCheck';

export const NoItemsMessage = ({
  list,
  itemName,
  whereToAddMessage,
  permissions,
}: {
  list: { total: number };
  itemName: string;
  whereToAddMessage: string;
  permissions: Permissions;
}) => {
  if (list.total > 0) return null;

  if (permissions.hasPermissions) {
    return (
      <>
        <h3 className="m-0">
          Oh no! You don&apos;t have any {itemName} on this list
        </h3>
        <h4 className="m-0">{whereToAddMessage}</h4>
      </>
    );
  }

  return <h3 className="m-0">Oh no! This list is empty :(</h3>;
};
